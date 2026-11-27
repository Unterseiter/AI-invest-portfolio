import styles from './FeaturesSection.module.scss';

const FEATURES = [
  {
    id: 'portfolio',
    title: 'Портфель без лишнего шума',
    description:
      'Вводите активы вручную. Никаких подключений к брокерам, никаких покупок, только изучение рынка. Учитесь, пробуйте - все в ваших руках!',
  },
  {
    id: 'ai',
    title: 'AI-прогноз, который не врёт',
    description:
      'Модель анализирует две метрики и показывает вероятную траекторию. Не гарантию - ориентир, который помогает думать, а не гадать.',
  },
  {
    id: 'privacy',
    title: 'Ваши данные остаются вашими',
    description:
      'Портфель хранится локально в вашем браузере. Никаких аккаунтов с серверами, никто не видит ваши позиции — кроме вас.',
  },
];

export default function FeaturesSection({ ref }) {
  return (
    <section ref={ref} className={styles.section} aria-labelledby="features-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Возможности</span>
          <h2 id="features-title" className={styles.title}>
            Что вы получаете
          </h2>
          <p className={styles.subtitle}>
            Вещи, которые делают портфель понятнее.
          </p>
        </header>

        <ul className={styles.grid}>
          {FEATURES.map(({ id, title, description }, index) => (
            <li key={id} className={styles.item}>
              <span className={styles.cardIndex} aria-hidden="true">
                0{index + 1}
              </span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardText}>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
