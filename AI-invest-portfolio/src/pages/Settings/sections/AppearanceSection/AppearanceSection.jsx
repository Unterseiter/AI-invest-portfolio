import { useThemeStore } from '@/features/theme/model/themeStore';
import SettingsGroup from '@/shared/ui/SettingsGroup';
import RadioCardGroup from '@/shared/ui/RadioCardGroup';
import styles from './AppearanceSection.module.scss';


const THEME_OPTIONS = [
  { value: 'light', label: 'Светлая', hint: 'Всегда светлое оформление' },
  { value: 'dark', label: 'Тёмная', hint: 'Всегда тёмное оформление' },
  { value: 'system', label: 'Системная', hint: 'Следует настройкам вашей ОС' },
];

export default function AppearanceSection() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <SettingsGroup
      title="Цветовая схема"
    >
      <RadioCardGroup
        name="theme"
        ariaLabel="Цветовая тема"
        value={mode}
        onChange={setMode}
        options={THEME_OPTIONS}
      />
    </SettingsGroup>
  );
}