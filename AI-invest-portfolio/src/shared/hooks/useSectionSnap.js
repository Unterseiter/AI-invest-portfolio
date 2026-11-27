import { useEffect } from 'react';

// Кривые плавности. Функция принимает t от 0 до 1 и возвращает прогресс 0..1.
const EASINGS = {
  veryEaseInOutCubic: (t) => (t < 0.5 ? 8 * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), // мягкий старт и финиш
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2), // чуть бодрее
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3), // резкий старт, мягкое торможение
};

// Ширина «шва» у последней точки: жест ВВЕРХ, сделанный внутри неё,
// сразу возвращает на предыдущий сегмент (без предварительного нативного шага).
const SEAM = 200;

/**
 * Пейджинг по сегментам. Страница делится на сегменты, начала которых
 * передаются через targetRefs. Пока скролл находится ВЫШЕ последнего
 * сегмента, любой жест (колесо, трекпад, клавиши) перехватывается и плавно
 * везёт пользователя на соседний сегмент. Ниже последней точки прокрутка
 * полностью нативная — там можно читать контент как обычно.
 *
 * Плавность достигается тем, что в зоне колесо/клавиши переводятся в
 * preventDefault: нативный скролл браузера не конкурирует с анимацией —
 * единственный, кто двигает страницу, это rAF-цикл ниже.
 *
 * ВАЖНО про вёрстку: каждый сегмент, по которому идёт пейджинг, должен
 * быть примерно высотой экрана (min-height: 100dvh). Иначе нижняя часть
 * высокой секции окажется внутри зоны перехвата и колесом будет
 * пролистываться. Последний сегмент может быть любой высоты.
 *
 * @param targetRef      ref (или массив ref) на элементы-начала сегментов.
 *                       Точка 0 (верх страницы) добавляется автоматически.
 * @param duration       максимальная длительность перехода, мс (короткие переходы быстрее)
 * @param easing         имя кривой из EASINGS
 * @param wheelThreshold сколько пикселей «пути» колеса накопить, чтобы жест сработал
 * @param settleDelay    для нативного скролла (касание/скроллбар): пауза после
 *                       остановки, после которой позицию доводят до ближайшего сегмента
 * @param headerSelector селектор sticky-шапки: её высота вычитается из каждой точки
 * @param enabled        быстрое выключение
 */
export function useSectionSnap(
  targetRef,
  {
    duration = 850,
    easing = 'easeInOutCubic',
    wheelThreshold = 40,
    settleDelay = 220,
    headerSelector = 'header',
    enabled = true,
  } = {},
) {
  useEffect(() => {
    if (!enabled) return;

    const refs = Array.isArray(targetRef) ? targetRef : [targetRef];
    const ease = EASINGS[easing] ?? EASINGS.easeInOutCubic;

    let raf = 0;
    let frameTimer = 0; // страховочный таймер кадра при троттлинге rAF
    let animGen = 0; // поколение анимации: отсекает кадры после отмены
    let settleTimer = 0;
    let animating = false; // идёт наш переход
    let pressed = false; // палец на экране или нажата кнопка мыши (тянут скроллбар/выделяют)
    let wheelAcc = 0; // накопленный «путь» колеса внутри одного жеста
    let wheelResetTimer = 0;

    const now = () => performance.now();

    // Точки привязки: верх страницы (0) + начала переданных сегментов.
    // Считаем на лету: ресайз, масштаб и сворачивание мобильного URL-бара
    // не ломают расчёт. Сортируем и убираем дубликаты на случай наложений.
    const getPoints = () => {
      const header = document.querySelector(headerSelector);
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const points = [0];
      for (const ref of refs) {
        const el = ref?.current;
        if (!el) continue;
        points.push(Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - headerH)));
      }
      return [...new Set(points)].sort((a, b) => a - b);
    };

    const lastPoint = (points) => points[points.length - 1];

    // Мы строго внутри зоны пейджинга (ещё не доехали до последнего сегмента).
    const inZone = (y, points) => points.length > 1 && y < lastPoint(points) - 2;

    // Следующая точка ниже y (жест вниз), предыдущая выше y (жест вверх),
    // ближайшая к y (доводка после нативного скролла).
    const nextPoint = (points, y) => points.find((p) => p > y + 2);
    const prevPoint = (points, y) => {
      for (let i = points.length - 1; i >= 0; i--) if (points[i] < y - 2) return points[i];
      return 0;
    };
    const nearestPoint = (points, y) =>
      points.reduce((best, p) => (Math.abs(p - y) < Math.abs(best - y) ? p : best), points[0]);

    const cancelAnimation = () => {
      if (animating) {
        animGen += 1; // чужие кадры/таймеры текущей анимации гасим
        cancelAnimationFrame(raf);
        clearTimeout(frameTimer);
        animating = false;
      }
    };

    const animateTo = (to) => {
      if (to == null) return;
      const from = window.scrollY;
      const dist = Math.abs(to - from);
      if (dist < 2) return;

      if (duration <= 0) {
        window.scrollTo(0, to);
        return;
      }

      // Переход всегда анимированный: даже при prefers-reduced-motion: reduce,
      // иначе с выключенными «эффектами анимации» в ОС пользователь получает
      // мгновенный прыжок, а здесь анимация — осознанная часть интерфейса.
      // Числовая форма scrollTo = мгновенный сдвиг на каждом кадре,
      // не зависит от CSS scroll-behavior.
      cancelAnimation();
      const time = Math.min(duration, Math.max(240, dist * 0.9)); // короткий переход = быстрый
      const start = now();
      const gen = ++animGen;
      animating = true;

      // Кадры идут по rAF (60 fps), а если браузер душит rAF (фоновая вкладка,
      // экономия энергии, свёрнутое окно) — подстраховываемся таймером ~30 fps,
      // чтобы переход всегда доезжал и не «замирал» на полпути.
      const tick = (t) => {
        if (gen !== animGen) return; // анимация отменена
        const p = Math.min(1, (t - start) / time);
        window.scrollTo(0, Math.round(from + (to - from) * ease(p)));
        if (p < 1) {
          cancelAnimationFrame(raf);
          clearTimeout(frameTimer);
          raf = requestAnimationFrame(tick);
          frameTimer = window.setTimeout(() => tick(now()), 32);
        } else {
          animating = false;
        }
      };
      raf = requestAnimationFrame(tick);
      frameTimer = window.setTimeout(() => tick(now()), 32);
    };

    // -------- колесо / трекпад: жест = переход на соседний сегмент --------
    const onWheel = (e) => {
      if (e.ctrlKey) return; // pinch-zoom — не перехватываем
      const points = getPoints();
      const y = window.scrollY;

      if (!inZone(y, points)) {
        // Шов у последней точки: жест вверх возвращает на предыдущий сегмент;
        // жест вниз — нативный скролл контента.
        const last = lastPoint(points);
        if (points.length > 1 && e.deltaY < 0 && y < last + SEAM) {
          e.preventDefault();
          if (!pressed && !animating) animateTo(prevPoint(points, y));
        } else {
          wheelAcc = 0;
        }
        return;
      }

      e.preventDefault(); // ПЕРЕХВАТ: в зоне скроллит только наша анимация — никакой борьбы
      if (pressed || animating) return;

      wheelAcc += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAcc = 0;
      }, 180);
      if (Math.abs(wheelAcc) < wheelThreshold) return; // ещё не жест

      wheelAcc = 0;
      animateTo(e.deltaY > 0 ? nextPoint(points, y) : prevPoint(points, y));
    };

    // -------- клавиатура --------
    const onKeyDown = (e) => {
      if (pressed || animating) return;
      const down = ['ArrowDown', 'PageDown', ' ', 'End'];
      const up = ['ArrowUp', 'PageUp', 'Home'];
      if (!down.includes(e.key) && !up.includes(e.key)) return;
      const points = getPoints();
      const y = window.scrollY;
      if (inZone(y, points)) {
        e.preventDefault();
        animateTo(down.includes(e.key) ? nextPoint(points, y) : prevPoint(points, y));
        return;
      }
      // Шов: «вверх» возвращает на предыдущий сегмент, остальное — нативное поведение
      const last = lastPoint(points);
      if (up.includes(e.key) && points.length > 1 && y < last + SEAM) {
        e.preventDefault();
        animateTo(prevPoint(points, y));
      }
    };

    // -------- нативный скролл (касание со свайпом, скроллбар) --------
    // Не перехватываем его (это неудобно), но после остановки внутри зоны
    // позицию доводят до ближайшего сегмента.
    const onScroll = () => {
      if (animating) return; // свою анимацию не обрабатываем
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (animating || pressed) return;
        const points = getPoints();
        const y = window.scrollY;
        if (!inZone(y, points)) return; // остановились ниже зоны — свободно
        animateTo(nearestPoint(points, y));
      }, settleDelay);
    };

    const press = () => {
      pressed = true;
      cancelAnimation();
      clearTimeout(settleTimer);
    };
    const release = () => {
      pressed = false;
    };

    window.addEventListener('wheel', onWheel, { passive: false }); // preventDefault → только так
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', press, { passive: true });
    window.addEventListener('touchend', release);
    window.addEventListener('touchcancel', release);
    window.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);

    return () => {
      clearTimeout(settleTimer);
      clearTimeout(wheelResetTimer);
      clearTimeout(frameTimer);
      animGen += 1;
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', press);
      window.removeEventListener('touchend', release);
      window.removeEventListener('touchcancel', release);
      window.removeEventListener('mousedown', press);
      window.removeEventListener('mouseup', release);
    };
  }, [targetRef, duration, easing, wheelThreshold, settleDelay, headerSelector, enabled]);
}
