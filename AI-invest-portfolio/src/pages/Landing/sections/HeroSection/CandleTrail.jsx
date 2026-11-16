// src/pages/Landing/sections/HeroSection/CandleTrail.jsx
import { useEffect, useRef } from 'react';
import styles from './CandleTrail.module.scss';

// ============================================================
// ★ РАЗМЕР СВЕЧЕЙ ★ — единственное место, где он регулируется
// Значения в CSS-px при масштабе страницы 100%. Масштаб браузера
// (Ctrl +/-) уменьшает/увеличивает их сам, ничего считать не нужно.
// ============================================================
const CANDLE_STEP = 22; // расстояние между свечами (больше = крупнее свечи)
const BODY_RATIO = 0.64; // толщина тела свечи как доля шага

// Что показывать на фоне: поставьте false, чтобы отключить элемент
const FEATURES = {
  grid: true,
  priceAxis: true,
  crosshair: true,
  volume: true,
  movingAverage: true,
  forecastCone: true,
  endMarker: true,
};

// Хаотичность графика
const JUMP_CHANCE = 0.1; // шанс резкого скачка/обвала на одной свече
const MA_PERIOD = 8; // период скользящей средней

// Раскладка
const PAD_L = 24; // отступ слева
const PAD_R = 68; // справа место под шкалу цены
const AXIS_H = 24; // снизу место под шкалу времени
const GRID_UNITS = 10; // шаг горизонтальной сетки (в единицах цены)
const GRID_COLS = 6; // вертикальная линия сетки каждые N свечей
const END_LEVELS = [0.14, 0.5, 0.86]; // верх / середина / низ
const END_SWITCH_MS = 6000;

// Перевод «внутренних единиц» в красивую цену для подписей
const BASE_PRICE = 1000;
const PRICE_PER_UNIT = 6;
const FONT = '11px ui-monospace, SFMono-Regular, Consolas, monospace';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const pad2 = (n) => String(n).padStart(2, '0');
const sign = () => (Math.random() < 0.5 ? -1 : 1);

function gauss() {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

// Время под свечой (фейковое, 5-минутные свечи с 09:00)
function timeLabel(i) {
  const m = 9 * 60 + i * 5;
  return `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`;
}

// Дописывает свечи в конец массива. Данные создаются один раз и не меняются.
function extendSeries(series, count) {
  const prev = series[series.length - 1];
  let price = prev ? prev.close : 0;
  let drift = prev ? prev.drift : 0;
  let regime = prev ? prev.regime : 1; // «настроение рынка»: спокойно / нервно
  let f = prev ? prev.f : 0;

  while (series.length < count) {
    // Кластеры волатильности: нервные участки сменяются спокойными
    regime = regime * 0.85 + (0.5 + Math.abs(gauss()) * 1.1) * 0.15;
    drift = drift * 0.55 + gauss() * 0.5 * regime;

    // Редкий резкий скачок или обвал
    const jump = Math.random() < JUMP_CHANCE ? sign() * (3 + Math.random() * 4) : 0;

    const open = price;
    const close = open + drift + gauss() * 0.9 * regime + jump - open * 0.035; // -open*0.035: возврат к среднему
    const bodySize = Math.abs(close - open);

    // Шум прогноза: резче, чем раньше, тоже с редкими скачками
    f = f * 0.5 + gauss() * 1.4 * regime;
    if (Math.random() < JUMP_CHANCE) f += sign() * (3 + Math.random() * 4);

    // Фитили: чаще короткие, иногда длинные
    const longWick = () => (Math.random() < 0.12 ? 1.5 + Math.random() * 2.5 : 0);

    series.push({
      open,
      close,
      up: Math.random() ** 2 * 1.4 * regime + longWick(),
      down: Math.random() ** 2 * 1.4 * regime + longWick(),
      volume: clamp(0.15 + bodySize / 6 + Math.random() * 0.35, 0.1, 1),
      f,
      drift,
      regime,
    });
    price = close;
  }
}

function drawCandle(ctx, x, body, openY, closeY, highY, lowY, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x + body / 2 - 0.5, highY, 1, lowY - highY); // фитиль
  ctx.fillRect(x, Math.min(openY, closeY), body, Math.max(1, Math.abs(closeY - openY))); // тело
}

export default function CandleTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;

    const series = [];
    const step0 = CANDLE_STEP;
    const size = { w: 0, h: 0, step: step0, body: Math.round(step0 * BODY_RATIO) };
    const colors = {
      up: '#26a69a',
      down: '#ef5350',
      accent: '#4f8cff',
      onAccent: '#ffffff',
      grid: '#2a3040',
      text: '#8a93a3',
    };
    const s = {
      ready: false,
      auto: noHover && !reduceMotion,
      headX: 0,
      headY: 0,
      targetX: 0,
      targetY: 0,
      offsetY: null,
      endY: 0,
      endLevel: 0.5,
    };

    let raf = 0;
    let last = 0;
    let visible = true;

    // ---------- вспомогательные ----------
    const pxPerUnit = () => clamp(size.h / 100, 4, 9); // вертикальный масштаб графика
    const lastCol = () =>
      Math.max(1, Math.floor((size.w - PAD_L - PAD_R - size.body) / size.step));
    const headCol = () => clamp(Math.round((s.headX - PAD_L) / size.step), 0, lastCol());

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const get = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
      colors.up = get('--color-positive', '#26a69a');
      colors.down = get('--color-negative', '#ef5350');
      colors.accent = get('--color-accent', '#4f8cff');
      colors.onAccent = get('--color-on-accent', '#ffffff');
      colors.grid = get('--chart-grid', '#2a3040');
      colors.text = get('--chart-text', '#8a93a3');
    };

    // ---------- логика кадра ----------
    const update = (dt, now) => {
      const ease = (rate) => 1 - Math.exp(-dt * rate);

      if (s.auto) {
        s.targetX = size.w * (0.5 + 0.28 * Math.sin(now / 2600));
        s.targetY = size.h * (0.5 + 0.16 * Math.sin(now / 1900 + 1));
      }

      s.headX += (s.targetX - s.headX) * ease(12);
      s.headY += (s.targetY - s.headY) * ease(12);

      const offsetTarget = s.headY + series[headCol()].close * pxPerUnit();
      s.offsetY =
        s.offsetY === null ? offsetTarget : s.offsetY + (offsetTarget - s.offsetY) * ease(14);

      const endTarget = size.h * s.endLevel;
      s.endY += (endTarget - s.endY) * ease(2.5);

      return (
        !s.auto &&
        Math.abs(s.targetX - s.headX) < 0.1 &&
        Math.abs(s.targetY - s.headY) < 0.1 &&
        Math.abs(offsetTarget - s.offsetY) < 0.1 &&
        Math.abs(endTarget - s.endY) < 0.1
      );
    };

    // Табличка (цена справа / время снизу)
    const drawTag = (text, cx, cy, w, h) => {
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.fillStyle = colors.onAccent;
      ctx.fillText(text, cx, cy + 0.5);
    };

    const render = () => {
      const { w, h, step, body } = size;
      ctx.clearRect(0, 0, w, h);
      ctx.font = FONT;
      ctx.textBaseline = 'middle';

      const px = pxPerUnit();
      const col = headCol();
      const end = lastCol();
      const left = PAD_L;
      const right = w - PAD_R;
      const bottom = h - AXIS_H;
      const colX = (i) => PAD_L + i * step; // левый край свечи i
      const midX = (i) => colX(i) + body / 2; // центр свечи i
      const toY = (v) => s.offsetY - v * px;

      // Видимый диапазон цен для горизонтальной сетки
      const vTop = s.offsetY / px;
      const vBottom = (s.offsetY - bottom) / px;
      const firstV = Math.ceil(vBottom / GRID_UNITS) * GRID_UNITS;

      // ---- Сетка ----
      if (FEATURES.grid) {
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        for (let v = firstV; v <= vTop; v += GRID_UNITS) {
          const y = Math.round(toY(v)) + 0.5;
          ctx.moveTo(left, y);
          ctx.lineTo(right, y);
        }
        for (let i = 0; i <= end; i += GRID_COLS) {
          const x = Math.round(midX(i)) + 0.5;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, bottom);
        }
        ctx.stroke();
      }

      // ---- Объёмы (только история) ----
      if (FEATURES.volume) {
        const maxH = h * 0.14;
        for (let i = 0; i <= col; i++) {
          const c = series[i];
          const vh = c.volume * maxH;
          ctx.globalAlpha = 0.1 + 0.2 * (col ? i / col : 1);
          ctx.fillStyle = c.close >= c.open ? colors.up : colors.down;
          ctx.fillRect(colX(i), bottom - vh, body, vh);
        }
      }

      // ---- Прогноз: геометрия ----
      const M = end - col;
      const baseAt = (i) => {
        const t = (i - col) / M;
        return s.headY + (s.endY - s.headY) * (t * t * (3 - 2 * t));
      };
      const yAt = (i) => {
        const taper = Math.min(1, (i - col) / 4); // шум нарастает с нуля, стык бесшовный
        return baseAt(i) - series[i].f * px * taper;
      };

      // ---- Конус неопределённости ----
      if (FEATURES.forecastCone && M > 0) {
        const spread = (i) => px * 9 * ((i - col) / M);
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(midX(col), s.headY);
        for (let i = col + 1; i <= end; i++) ctx.lineTo(midX(i), baseAt(i) - spread(i));
        for (let i = end; i > col; i--) ctx.lineTo(midX(i), baseAt(i) + spread(i));
        ctx.closePath();
        ctx.fill();
      }

      // ---- История: свечи ----
      for (let i = 0; i <= col; i++) {
        const c = series[i];
        const hi = Math.max(c.open, c.close) + c.up;
        const lo = Math.min(c.open, c.close) - c.down;
        ctx.globalAlpha = 0.18 + 0.82 * (col ? i / col : 1);
        drawCandle(
          ctx,
          colX(i),
          body,
          toY(c.open),
          toY(c.close),
          toY(hi),
          toY(lo),
          c.close >= c.open ? colors.up : colors.down,
        );
      }

      // ---- Скользящая средняя ----
      if (FEATURES.movingAverage && col > 1) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        for (let i = 0; i <= col; i++) {
          let sum = 0;
          let n = 0;
          for (let k = Math.max(0, i - MA_PERIOD + 1); k <= i; k++) {
            sum += series[k].close;
            n++;
          }
          const y = toY(sum / n);
          if (i === 0) ctx.moveTo(midX(i), y);
          else ctx.lineTo(midX(i), y);
        }
        ctx.stroke();
      }

      // ---- Прогноз: свечи ----
      if (M > 0) {
        for (let i = col + 1; i <= end; i++) {
          const openY = yAt(i - 1);
          const closeY = yAt(i);
          const t = (i - col) / M;
          ctx.globalAlpha = 0.4 * (1 - 0.75 * t);
          drawCandle(
            ctx,
            colX(i),
            body,
            openY,
            closeY,
            Math.min(openY, closeY) - series[i].up * px,
            Math.max(openY, closeY) + series[i].down * px,
            closeY <= openY ? colors.up : colors.down,
          );
        }
      }

      // ---- Метка конца прогноза ----
      if (FEATURES.endMarker && M > 0) {
        const ex = midX(end);
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ex, s.endY, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'right';
        ctx.fillText('AI-прогноз', ex - 12, s.endY - 12);
      }

      // ---- Перекрестие ----
      if (FEATURES.crosshair) {
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(Math.round(s.headX) + 0.5, 0);
        ctx.lineTo(Math.round(s.headX) + 0.5, bottom);
        ctx.moveTo(left, Math.round(s.headY) + 0.5);
        ctx.lineTo(right, Math.round(s.headY) + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ---- Шкалы: подписи цены справа и времени снизу ----
      if (FEATURES.priceAxis) {
        ctx.fillStyle = colors.text;
        ctx.globalAlpha = 0.9;
        ctx.textAlign = 'left';
        for (let v = firstV; v <= vTop; v += GRID_UNITS) {
          const price = Math.round(BASE_PRICE + v * PRICE_PER_UNIT);
          ctx.fillText(price.toLocaleString('ru-RU'), right + 8, toY(v));
        }
        ctx.textAlign = 'center';
        for (let i = 0; i <= end; i += GRID_COLS) {
          ctx.fillText(timeLabel(i), midX(i), bottom + AXIS_H / 2);
        }
      }

      // Таблички под курсором (цена на правой оси, время на нижней)
      if (FEATURES.crosshair && FEATURES.priceAxis) {
        ctx.textAlign = 'center';
        const headPrice = BASE_PRICE + ((s.offsetY - s.headY) / px) * PRICE_PER_UNIT;
        drawTag(
          headPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          right + PAD_R / 2 - 2,
          s.headY,
          PAD_R - 4,
          20,
        );
        drawTag(timeLabel(col), s.headX, bottom + AXIS_H / 2, 48, 18);
      }

      // ---- Голова: точка с мягким кольцом ----
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(s.headX, s.headY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(s.headX, s.headY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    // ---------- цикл анимации ----------
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const settled = update(dt, now);
      render();
      raf = settled || !visible ? 0 : requestAnimationFrame(frame);
    };

    const request = () => {
      if (raf || !visible || !s.ready) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // ---------- события ----------
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.w = rect.width;
      size.h = rect.height;

      extendSeries(series, lastCol() + 1);

      if (!s.ready) {
        s.headX = s.targetX = size.w / 2;
        s.headY = s.targetY = size.h / 2;
        s.endY = size.h * s.endLevel;
        s.ready = true;
      }
      request();
      if (!raf) render();
    };

    const onPointerMove = (e) => {
      if (!s.ready) return;
      const rect = canvas.getBoundingClientRect();
      s.auto = false;
      s.targetX = clamp(e.clientX - rect.left, 0, size.w);
      s.targetY = clamp(e.clientY - rect.top, 0, size.h - AXIS_H);
      request();
    };

    const pickNextEnd = () => {
      const others = END_LEVELS.filter((l) => l !== s.endLevel);
      s.endLevel = others[Math.floor(Math.random() * others.length)];
      request();
    };

    readColors();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        request();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    intersectionObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readColors();
      request();
      if (!raf && s.ready) render();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    const endTimer = reduceMotion ? 0 : window.setInterval(pickNextEnd, END_SWITCH_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(endTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}