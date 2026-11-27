import { useThemeStore } from '@/features/theme/model/themeStore';
import SettingsGroup from '@/shared/ui/SettingsGroup';
import RadioCardGroup from '@/shared/ui/RadioCardGroup';
import styles from './AppearanceSection.module.scss';


const THEME_OPTIONS = [
  { value: 'light', label: 'Светлая', hint: 'Строгая деловая светлая тема' },
  { value: 'dark', label: 'Тёмная', hint: 'Терминал трейдера: чёрный и янтарь' },
  { value: 'cyberp', label: 'Киберпанк', hint: 'Неоновая тёмная тема' },
  { value: 'paper', label: 'Бумага', hint: '---' },
  { value: 'espresso', label: 'Еспрессо темная', hint: '---' },
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