import { useEffect } from 'react';

// Кривые плавности. Можно добавить свою: функция принимает t от 0 до 1 и возвращает прогресс.
const EASINGS = {
  veryEaseInOutCubic: (t) => (t < 1 ? 8 * t * t * t : 1 - Math.pow(-2 * t + 2,4) / 2),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), // мягкий старт и финиш
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2), // чуть бодрее
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3), // резкий старт, мягкое торможение
};

/**
 * Доводит прокрутку от верха страницы до начала целевой секции (и обратно),
 * чтобы пользователь не оставался «на полпути».
 *
 * @param targetRef      ref на элемент, с которого начинается вторая секция
 * @param duration       максимальная длительность доводки, мс (короткие доводки быстрее)
 * @param easing         имя кривой из EASINGS
 * @param threshold      какую долю пути надо пройти в сторону цели, чтобы доехать до конца (0.08 = 8%)
 * @param idleDelay      сколько мс без прокрутки считать «остановкой»
 * @param headerSelector селектор sticky-шапки: её высота вычитается, чтобы секция не пряталась под ней
 * @param enabled        быстрое выключение
 */
export function useSectionSnap(
  targetRef,
  {
    duration = 1000,
    easing = 'easeInOutCubic',
    threshold = 0.08,
    idleDelay = 10,
    headerSelector = 'header',
    enabled = true,
  } = {},
) {
  useEffect(() => {
    if (!enabled) return;

    const ease = EASINGS[easing] ?? EASINGS.easeInOutCubic;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let idleTimer = 0;
    let raf = 0;
    let animating = false; // идёт наша анимация
    let pressed = false; // палец на экране или нажата кнопка мыши (например, тянут полосу прокрутки)
    let lastY = window.scrollY;
    let dir = 0; // 1: листают вниз, -1: вверх, 0: неизвестно

    // Позиция прокрутки, при которой вторая секция стоит прямо под шапкой.
    // Считаем при каждой проверке заново, поэтому масштаб, ресайз и смена шрифтов не ломают расчёт.
    const getBottomTarget = () => {
      const el = targetRef.current;
      if (!el) return 0;
      const header = document.querySelector(headerSelector);
      const headerH = header ? header.getBoundingClientRect().height : 0;
      return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - headerH));
    };

    const cancel = () => {
      if (animating) {
        cancelAnimationFrame(raf);
        animating = false;
      }
      lastY = window.scrollY;
    };

    const animateTo = (to) => {
      const from = window.scrollY;
      const dist = Math.abs(to - from);
      if (dist < 1) return;

      // behavior: 'instant', чтобы глобальный scroll-behavior: smooth не мешал покадровой анимации
      if (reduceMotion.matches || duration <= 0) {
        window.scrollTo({ top: to, behavior: 'instant' });
        return;
      }

      const time = Math.min(duration, Math.max(250, dist * 0.9)); // короткая доводка = быстрая
      const start = performance.now();
      animating = true;

      const tick = (now) => {
        const t = Math.min(1, (now - start) / time);
        window.scrollTo({ top: from + (to - from) * ease(t), behavior: 'instant' });
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          animating = false;
          lastY = window.scrollY;
        }
      };
      raf = requestAnimationFrame(tick);
    };

    // Прокрутка остановилась: решаем, куда доехать
    const settle = () => {
      if (animating || pressed) return;

      const bottom = getBottomTarget();
      const y = window.scrollY;
      if (bottom <= 0 || y <= 1 || y >= bottom - 1) return; // вне зоны или уже на месте

      const progress = y / bottom; // 0 = верх страницы, 1 = начало второй секции
      let goDown;
      if (dir > 0) goDown = progress > threshold; // листали вниз: чуть сдвинулись, и едем вниз
      else if (dir < 0) goDown = progress > 1 - threshold; // листали вверх: чуть сдвинулись, и едем вверх
      else goDown = progress > 0.5; // направление неизвестно: к ближайшей

      animateTo(goDown ? bottom : 0);
    };

    const onScroll = () => {
      if (animating) return; // свою же анимацию не обрабатываем
      const y = window.scrollY;
      if (y !== lastY) dir = y > lastY ? 1 : -1;
      lastY = y;
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(settle, idleDelay);
    };

    const press = () => {
      pressed = true;
      cancel();
      clearTimeout(idleTimer);
    };
    const release = () => {
      pressed = false;
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(settle, idleDelay);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    window.addEventListener('touchstart', press, { passive: true });
    window.addEventListener('touchend', release);
    window.addEventListener('touchcancel', release);
    window.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);

    return () => {
      clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('keydown', cancel);
      window.removeEventListener('touchstart', press);
      window.removeEventListener('touchend', release);
      window.removeEventListener('touchcancel', release);
      window.removeEventListener('mousedown', press);
      window.removeEventListener('mouseup', release);
    };
  }, [targetRef, duration, easing, threshold, idleDelay, headerSelector, enabled]);
}