import { useThemeStore } from '../model/themeStore';
import { SunIcon, MoonIcon, SystemIcon } from '@/assets/svg/ThemeIcons.jsx';
import styles from './ThemeToggle.module.scss';

const MODES = [
  { value: 'light', label: 'Светлая тема', Icon: SunIcon },
  { value: 'dark', label: 'Тёмная тема', Icon: MoonIcon },
  { value: 'system', label: 'Системная тема', Icon: SystemIcon },
];

export default function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const currentIndex = MODES.findIndex((m) => m.value === mode);
  const current = MODES[currentIndex] ?? MODES[0];

  const handleClick = () => {
    const next = MODES[(currentIndex + 1) % MODES.length];
    setMode(next.value);
  };

  const Icon = current.Icon;

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleClick}
      aria-label={`Тема: ${current.label}. Нажмите, чтобы переключить.`}
      title={current.label}
    >
      <Icon size={20} />
    </button>
  );
}