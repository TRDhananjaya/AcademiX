import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturedImage from '../components/FeaturedImage';
import EcosystemSection from '../components/EcosystemSection';
import Footer from '../components/Footer';

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
