import { useEffect } from 'react';

/**
 * Включает привязку прокрутки на <html> только пока страница на экране.
 * Сами правила лежат в styles/_scroll.scss и срабатывают по атрибуту data-snap.
 */
export function useScrollSnap(axis = 'y') {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.snap = axis;
    return () => {
      delete root.dataset.snap;
    };
  }, [axis]);
}