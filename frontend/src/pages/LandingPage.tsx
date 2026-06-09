import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ShowcaseBanner } from '../components/ShowcaseBanner';
import { TrustStats } from '../components/TrustStats';
import { FeatureCards } from '../components/FeatureCards';
import { HowItWorks } from '../components/HowItWorks';
import { SocialCommunity } from '../components/SocialCommunity';
import { AIShowcase } from '../components/AIShowcase';
import { ResearchSection } from '../components/ResearchSection';
import { MobilePreview } from '../components/MobilePreview';
import { Testimonials } from '../components/Testimonials';
import { FutureVision } from '../components/FutureVision';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export const LandingPage = () => {

  const openAuth = (tab: 'login' | 'register') => {
    window.location.href = `/auth.html?tab=${tab}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden font-poppins selection:bg-primary/30 selection:text-white">
      {/* Global Background Effects - Optimized for Performance */}
      <div className="fixed inset-0 bg-grid-pattern z-0 opacity-20 pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none animate-blob" />
      <div className="fixed top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none animate-blob animation-delay-2000" />
      <div className="fixed bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none animate-blob animation-delay-4000" />

      <Navbar onOpenAuth={openAuth} />

      <main className="relative z-10 pt-16">
        <HeroSection onOpenAuth={openAuth} />
        <ShowcaseBanner />
        <TrustStats />
        <FeatureCards />
        <HowItWorks />
        <SocialCommunity />
        <AIShowcase />
        <ResearchSection />
        <MobilePreview />
        <Testimonials />
        <FutureVision onOpenAuth={openAuth} />
        <FinalCTA onOpenAuth={openAuth} />
      </main>

      <Footer />
    </div>
  );
};
