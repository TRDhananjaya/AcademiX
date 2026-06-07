import Header from '../components/home/Header';
import HeroSection from '../components/home/HeroSection';
import FeaturedImage from '../components/home/FeaturedImage';
import EcosystemSection from '../components/home/EcosystemSection';
import Footer from '../components/home/Footer';

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
