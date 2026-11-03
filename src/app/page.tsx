import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/home/HeroSection';
import ArchitectureSection from '@/components/home/ArchitectureSection';
import GptSection from '@/components/home/GptSection';
import QwenSection from '@/components/home/QwenSection';
import CtaBanner from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <div className="app-frame">
      <Navbar />

      <main className="app-container">
        <HeroSection />
        <div className="section-divider" aria-hidden="true" />
        <ArchitectureSection />
        <div className="section-divider" aria-hidden="true" />
        <GptSection />
        <div className="section-divider" aria-hidden="true" />
        <QwenSection />
        <CtaBanner />
      </main>

      <Footer />
    </div>
  );
}
