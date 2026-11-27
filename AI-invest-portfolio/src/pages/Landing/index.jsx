import { useRef } from 'react';
import { useSectionSnap } from '@/shared/hooks/useSectionSnap';
import HeroSection from './sections/HeroSection/HeroSection';
import SocialProofSection from './sections/SocialProofSection/SocialProofSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import styles from './Landing.module.scss';

export default function Landing() {
  // Точки пейджинга: верх страницы добавляется хуком автоматически,
  // сюда — начала остальных сегментов (порядок не важен, хук сортирует).
  const proofRef = useRef(null); // сегмент «Ключевые факты»
  const featuresRef = useRef(null); // сегмент «Что вы получаете»

  // Массив пересоздаётся каждый рендер — хук перевешивает слушателей.
  // Для статичной страницы это незаметно; если станет важно — оберни в useMemo.
  useSectionSnap([proofRef, featuresRef], { duration: 850 });

  return (
    <div className={styles.page}>
      <HeroSection />
      <div className={styles.rest}>
        <SocialProofSection ref={proofRef} />
        <FeaturesSection ref={featuresRef} />
      </div>
    </div>
  );
}
