import { Link } from 'react-router-dom';
import CandleTrail from './CandleTrail';
import styles from './HeroSection.module.scss';

export default function HeroSection() {
  return (
    <section className={styles.hero} aria-label='Знакомство с продуктом'>
      <CandleTrail />
      <div className={styles.content}>
        <h1 className={styles.headline}>
          Твой портфель под контролем.<br />
          AI подскажет, куда он движется.
        </h1>
        <p className={styles.subheadline}>
          Вводи активы вручную, прогнозируй, действуй.
        </p>
        <div className={styles.ctaGroup}>
          <Link to="/auth?mode=register" className={styles.ctaPrimary}>Попробовать</Link>
          <Link to="/auth" className={styles.ctaSecondary}>Войти</Link>
        </div>
      </div>
      <div>
        
      </div>
    </section>
  );
}