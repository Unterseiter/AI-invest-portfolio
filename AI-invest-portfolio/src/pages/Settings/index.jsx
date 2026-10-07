import AppearanceSection from './sections/AppearanceSection';
import styles from './Settings.module.scss';

const SECTIONS = [
  {
    id: 'appearance',
    title: 'Внешний вид',
    Component: AppearanceSection,
  },
  // Сюда добавим: currency, portfolio, about
];

export default function Settings() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Настройки</h1>
      </header>

      <div className={styles.content}>
        {SECTIONS.map(({ id, title, Component }) => (
          <section key={id} className={styles.section}>
            <h3 className={styles.sectionTitle}>{title}</h3>
            <Component />
          </section>
        ))}
      </div>
    </div>
  );
}