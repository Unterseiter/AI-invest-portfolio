import styles from './SocialProofSection.module.scss';

const STATS = [
  { value: '75%', label: 'точность AI-прогноза на исторических данных' },
  { value: '2', label: 'метрики в основе модели' },
  { value: '1 раз', label: 'введите данные портфеля — они останутся с вами' },
  { value: '0', label: 'трекеров и передачи данных третьим лицам' },
];

export default function SocialProofSection({ ref }) {
  return (
    <section ref={ref} className={styles.section} aria-label="Ключевые факты о продукте">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Ключевые факты</span>
          <h2 className={styles.title}>Цифры, а не обещания</h2>
          <p className={styles.subtitle}>
            Всё, что важно знать о продукте — коротко и по делу.
          </p>
        </header>
        <ul className={styles.stats}>
          {STATS.map(({ value, label }) => (
            <li key={label} className={styles.stat}>
              <span className={styles.value}>{value}</span>
              <span className={styles.label}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
