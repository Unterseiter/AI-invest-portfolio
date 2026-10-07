import { create } from 'zustand';

const STORAGE_KEY = 'theme-mode'; // 'light' | 'dark' | 'system'
const MODES = ['light', 'dark', 'system'];

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

const readMode = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(saved) ? saved : 'system';
  } catch {
    return 'system'; // localStorage недоступен (приватный режим и т.п.)
  }
};

const resolveTheme = (mode) =>
  mode === 'system' ? (systemQuery().matches ? 'dark' : 'light') : mode;

const apply = (mode) => {
  const resolved = resolveTheme(mode);
  document.documentElement.dataset.theme = resolved;
  useThemeStore.setState({ resolved });
};

export const useThemeStore = create((set) => ({
  mode: readMode(),
  resolved: resolveTheme(readMode()), // фактическая тема: 'light' | 'dark' (пригодится графикам)
  setMode: (mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ничего страшного, просто не запомним */
    }
    set({ mode });
    apply(mode);
  },
}));

// Вызывается один раз при старте приложения
export function initTheme() {
  apply(useThemeStore.getState().mode);

  // Системная тема изменилась: реагируем, только если выбран режим «Авто»
  systemQuery().addEventListener('change', () => {
    if (useThemeStore.getState().mode === 'system') apply('system');
  });

  // Тема сменилась в другой вкладке
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const mode = readMode();
    useThemeStore.setState({ mode });
    apply(mode);
  });
}