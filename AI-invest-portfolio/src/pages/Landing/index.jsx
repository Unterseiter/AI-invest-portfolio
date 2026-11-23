import HeroSection from './sections/HeroSection/HeroSection';
import SocialProofSection from './sections/SocialProofSection/SocialProofSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import styles from './Landing.module.scss';

export default function Landing() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
    </div>
  );
}