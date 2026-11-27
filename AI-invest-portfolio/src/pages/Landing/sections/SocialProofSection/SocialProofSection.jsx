import styles from './SocialProofSection.module.scss';

const STATS = [
  { value: '75%', label: 'точность AI-прогноза на исторических данных' },
  { value: '2', label: 'метрики в основе модели' },
  { value: '1 раз', label: 'введите данные портфеля один раз — они останутся с вами' },
  { value: '0', label: 'трекеров и передачи данных третьим лицам' },
];

export default function SocialProofSection({ ref }) {
  return (
    <section ref={ref} className={styles.section} aria-label="Ключевые факты о продукте">
      <ul className={styles.stats}>
        {STATS.map(({ value, label }) => (
          <li key={label} className={styles.stat}>
            <span className={styles.value}>{value}</span>
            <span className={styles.label}>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}