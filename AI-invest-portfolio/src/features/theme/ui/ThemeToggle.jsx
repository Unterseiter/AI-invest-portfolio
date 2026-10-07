import { useThemeStore } from '../model/themeStore';
import styles from './ThemeToggle.module.scss';

const OPTIONS = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Авто' },
];

export default function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <div className={styles.group} role="radiogroup" aria-label="Тема оформления">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          className={mode === value ? `${styles.option} ${styles.active}` : styles.option}
          onClick={() => setMode(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}