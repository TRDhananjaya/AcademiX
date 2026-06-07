import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import FeaturedImage from '../components/landing/FeaturedImage';
import EcosystemSection from '../components/landing/EcosystemSection';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturedImage />
      <EcosystemSection />
      <Footer />
    </div>
  );
}
