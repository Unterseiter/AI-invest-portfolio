import { useRef } from 'react';
import { useSectionSnap } from '@/shared/hooks/useSectionSnap';
import HeroSection from './sections/HeroSection/HeroSection';
import SocialProofSection from './sections/SocialProofSection/SocialProofSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import styles from './Landing.module.scss';

export default function Landing() {
  const restRef = useRef(null); // «начало второй секции»

  useSectionSnap(restRef, {
    duration: 1000,
    easing: 'easeInOutCubic',
    threshold: 0.08,
  });

  return (
    <div className={styles.page}>
      <HeroSection />
      <div ref={restRef} className={styles.rest}>
        <SocialProofSection />
        <FeaturesSection />
      </div>
    </div>
  );
}