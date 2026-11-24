import { useScrollSnap } from '@/shared/hooks/useScrollSnap'; 
import HeroSection from './sections/HeroSection/HeroSection';
import SocialProofSection from './sections/SocialProofSection/SocialProofSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import styles from './Landing.module.scss';

export default function Landing() {
  useScrollSnap();

  return (
    <div className={styles.page}>
      <HeroSection />
      <div className={styles.rest}>
        <SocialProofSection />
        <FeaturesSection />
      </div>
    </div>
  );
}