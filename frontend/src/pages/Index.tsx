import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';
import introVideo from '@/assets/introdiv.mp4';

const Index = () => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if video was already shown this session
    const videoShown = sessionStorage.getItem('introVideoShown');
    if (videoShown) {
      setVideoEnded(true);
    }
  }, []);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    sessionStorage.setItem('introVideoShown', 'true');
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    // Auto-play the video when loaded
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // If autoplay fails (browser policy), skip to content
        setVideoEnded(true);
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>ApparelDesk - Premium Clothing for Everyone</title>
        <meta 
          name="description" 
          content="Discover premium clothing at ApparelDesk. Shop the latest collection of men's, women's, and children's apparel with quality craftsmanship and timeless style." 
        />
      </Helmet>

      {/* Fullscreen Video Intro with smooth curtain reveal */}
      <div 
        className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-all duration-[1500ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
          videoEnded ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100 scale-100'
        }`}
      >
        <video
          ref={videoRef}
          src={introVideo}
          className={`w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          muted
          playsInline
          onLoadedData={handleVideoLoaded}
          onEnded={handleVideoEnd}
        />
        {/* Skip button (subtle, bottom right) */}
        <button
          onClick={handleVideoEnd}
          className="absolute bottom-8 right-8 text-white/60 hover:text-white text-sm font-medium transition-colors backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
        >
          Skip Intro →
        </button>
        {/* Loading indicator */}
        {!videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-[1200ms] ease-out ${videoEnded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Layout>
          <HeroSection />
          <CategorySection />
          <FeaturedProducts />
          <PromoSection />
        </Layout>
      </div>
    </>
  );
};

export default Index;
