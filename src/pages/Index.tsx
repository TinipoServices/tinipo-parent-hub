import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import FeedbackSection from '@/components/sections/FeedbackSection';
import ContactSection from '@/components/sections/ContactSection';
import PrivacySection from '@/components/sections/PrivacySection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <FeedbackSection />
        <ContactSection />
        <PrivacySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
