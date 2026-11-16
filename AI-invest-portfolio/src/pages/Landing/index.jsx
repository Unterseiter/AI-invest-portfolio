// import { Link } from 'react-router-dom';
// import styles from './sections/HeroSection/HeroSection.module.scss';

// export default function HeroSection() {
//   return (
//     <section className={styles.hero}>
//       <div className={styles.heroContent}>
//         <h1 className={styles.headline}>
//           Твой портфель под контролем.<br />
//           AI подскажет, куда он движется.
//         </h1>
//         <p className={styles.subheadline}>
//           Вводи активы вручную. Данные хранятся только у тебя. 
//           Наш AI анализирует траекторию на основе двух метрик.
//         </p>
//         <div className={styles.ctaGroup}>
//           <Link to="/auth?mode=register" className={styles.ctaPrimary}>
//             Попробовать
//           </Link>
//           <Link to="/auth" className={styles.ctaSecondary}>
//             Войти
//           </Link>
//         </div>
//       </div>
//       <div className={styles.heroVisual}>
//         {/* Здесь будет интерактивный мини-дашборд или скриншот */}
//         <div className={styles.visualPlaceholder}>
//           <span>Визуал продукта</span>
//         </div>
//       </div>
//     </section>
//   );
// }


import HeroSection from './sections/HeroSection/HeroSection';
import styles from './Landing.module.scss';

export default function Landing() {
  return (
    <div className={styles.page}>
      <HeroSection />
      {/* Сюда потом добавим FeaturesSection, HowItWorks, FAQ и т.д. */}
    </div>
  );
}