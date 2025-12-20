import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Percent, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Offer {
  id: number;
  name: string;
  discount_percentage: number;
  early_payment_discount: number;
  early_payment_days: number;
  days: number;
  description?: string;
}

// Fallback offers when backend has none
const fallbackOffers: Offer[] = [
  {
    id: 1,
    name: "New Customer Welcome",
    discount_percentage: 20,
    early_payment_discount: 0,
    early_payment_days: 0,
    days: 0,
    description: "Get 20% off on your first order. Use code WELCOME20"
  },
  {
    id: 2,
    name: "Early Bird Special",
    discount_percentage: 0,
    early_payment_discount: 15,
    early_payment_days: 3,
    days: 30,
    description: "Pay within 3 days and save 15% on your order"
  },
  {
    id: 3,
    name: "Festival Sale",
    discount_percentage: 25,
    early_payment_discount: 0,
    early_payment_days: 0,
    days: 0,
    description: "Celebrate with us! 25% off on all ethnic wear"
  }
];

const gradients = [
  'from-amber-700 via-brown-600 to-brown-800',
  'from-purple-700 via-purple-600 to-indigo-800',
  'from-emerald-700 via-teal-600 to-cyan-800',
  'from-rose-700 via-pink-600 to-fuchsia-800',
  'from-blue-700 via-indigo-600 to-violet-800',
];

const PromoSection = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tearProgress, setTearProgress] = useState(0);
  const [isTearing, setIsTearing] = useState(false);
  const [tearDirection, setTearDirection] = useState<'up' | 'down'>('down');
  const containerRef = useRef<HTMLDivElement>(null);
  const accumulatedScroll = useRef(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tearThreshold = 180;

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/orders/offers');
        if (res.data && res.data.length > 0) {
          setOffers(res.data);
        } else {
          setOffers(fallbackOffers);
        }
      } catch (error) {
        console.error('Failed to fetch offers:', error);
        setOffers(fallbackOffers);
      }
    };
    fetchOffers();
  }, []);

  // Handle scroll for page tear effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container || offers.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
      
      if (!inView) return;
      
      e.preventDefault();
      
      // Clear any pending reset
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      
      const direction = e.deltaY > 0 ? 'down' : 'up';
      setTearDirection(direction);
      
      // Accumulate scroll
      accumulatedScroll.current += Math.abs(e.deltaY);
      
      // Calculate tear progress (0 to 1)
      const progress = Math.min(accumulatedScroll.current / tearThreshold, 1);
      setTearProgress(progress);
      setIsTearing(true);
      
      // When tear is complete, transition to next/prev offer
      if (progress >= 1) {
        accumulatedScroll.current = 0;
        setTearProgress(0);
        setIsTearing(false);
        
        if (direction === 'down') {
          setActiveIndex((prev) => (prev + 1) % offers.length);
        } else {
          setActiveIndex((prev) => (prev - 1 + offers.length) % offers.length);
        }
      }
      
      // Reset tear if no scroll for a while
      resetTimeoutRef.current = setTimeout(() => {
        if (accumulatedScroll.current > 0 && accumulatedScroll.current < tearThreshold) {
          accumulatedScroll.current = 0;
          setTearProgress(0);
          setIsTearing(false);
        }
      }, 400);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [offers.length]);

  // Touch support
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (offers.length <= 1) return;
    
    const diff = touchStartY.current - e.touches[0].clientY;
    const direction = diff > 0 ? 'down' : 'up';
    setTearDirection(direction);
    
    const progress = Math.min(Math.abs(diff) / 150, 1);
    setTearProgress(progress);
    setIsTearing(true);
  };

  const handleTouchEnd = () => {
    if (tearProgress > 0.5) {
      if (tearDirection === 'down') {
        setActiveIndex((prev) => (prev + 1) % offers.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + offers.length) % offers.length);
      }
    }
    setTearProgress(0);
    setIsTearing(false);
  };

  const getDiscountText = (offer: Offer) => {
    if (offer.discount_percentage > 0) {
      return `${offer.discount_percentage}% OFF`;
    }
    if (offer.early_payment_discount > 0) {
      return `${offer.early_payment_discount}% OFF`;
    }
    return 'Special Offer';
  };

  const getOfferDetails = (offer: Offer) => {
    if (offer.early_payment_discount > 0) {
      return `Pay within ${offer.early_payment_days} days and save!`;
    }
    return offer.description || `Valid for ${offer.days} days`;
  };

  if (offers.length === 0) {
    return null;
  }

  const nextIndex = tearDirection === 'down' 
    ? (activeIndex + 1) % offers.length 
    : (activeIndex - 1 + offers.length) % offers.length;

  // Generate jagged tear path
  const generateTearPath = (progress: number, isTop: boolean) => {
    const points: string[] = [];
    const segments = 12;
    const baseY = isTop ? 100 - progress * 25 : progress * 25;
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 100;
      const jag = Math.sin(i * 2.5 + progress * 5) * (3 + progress * 8);
      const y = baseY + jag;
      points.push(`${x}% ${y}%`);
    }
    
    if (isTop) {
      return `polygon(0 0, 100% 0, ${points.reverse().join(', ')})`;
    } else {
      return `polygon(${points.join(', ')}, 100% 100%, 0 100%)`;
    }
  };

  return (
    <section 
      ref={containerRef}
      className="py-16 lg:py-24 bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl" style={{ height: '380px', perspective: '1200px' }}>
          
          {/* Next offer (revealed underneath during tear) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradients[nextIndex % gradients.length]}`}
            style={{ zIndex: 10 }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }} />
            </div>
            <div className="relative h-full p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  {offers[nextIndex]?.early_payment_discount > 0 ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Ticket className="h-4 w-4" />
                  )}
                  {offers[nextIndex]?.name}
                </div>
                <h2 className="font-display text-3xl lg:text-5xl font-bold text-primary-foreground mb-4 flex items-center gap-3 justify-center lg:justify-start">
                  <Percent className="h-10 w-10 lg:h-12 lg:w-12" />
                  {getDiscountText(offers[nextIndex])}
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-md mb-2">
                  {getOfferDetails(offers[nextIndex])}
                </p>
              </div>
              <Link to="/products">
                <Button variant="hero" size="xl" className="bg-white text-gray-800 hover:bg-white/90 shadow-xl">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Current offer (tears away on scroll) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradients[activeIndex % gradients.length]}`}
            style={{
              zIndex: 20,
              transform: isTearing 
                ? tearDirection === 'down'
                  ? `translateY(-${tearProgress * 105}%) rotateX(${tearProgress * 20}deg)`
                  : `translateY(${tearProgress * 105}%) rotateX(-${tearProgress * 20}deg)`
                : 'translateY(0) rotateX(0deg)',
              transformOrigin: tearDirection === 'down' ? 'top center' : 'bottom center',
              clipPath: isTearing 
                ? generateTearPath(tearProgress, tearDirection === 'down')
                : 'none',
              transition: isTearing ? 'none' : 'all 0.3s ease-out',
              boxShadow: isTearing 
                ? `0 ${tearDirection === 'down' ? '' : '-'}${tearProgress * 40}px ${tearProgress * 50}px rgba(0,0,0,0.4)` 
                : 'none',
              filter: isTearing ? `brightness(${1 - tearProgress * 0.15})` : 'none',
            }}
          >
            {/* Torn paper edge shadow */}
            {isTearing && (
              <div 
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  [tearDirection === 'down' ? 'bottom' : 'top']: '-2px',
                  height: '30px',
                  background: tearDirection === 'down'
                    ? 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
                    : 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
                  transform: tearDirection === 'down' ? 'none' : 'rotate(180deg)',
                }}
              />
            )}
            
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }} />
            </div>

            <div className="relative h-full p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  {offers[activeIndex]?.early_payment_discount > 0 ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Ticket className="h-4 w-4" />
                  )}
                  {offers[activeIndex]?.name}
                </div>
                <h2 className="font-display text-3xl lg:text-5xl font-bold text-primary-foreground mb-4 flex items-center gap-3 justify-center lg:justify-start">
                  <Percent className="h-10 w-10 lg:h-12 lg:w-12" />
                  {getDiscountText(offers[activeIndex])}
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-md mb-2">
                  {getOfferDetails(offers[activeIndex])}
                </p>
                {offers[activeIndex]?.description && offers[activeIndex]?.early_payment_discount === 0 && (
                  <p className="text-primary-foreground/60 text-sm">
                    {offers[activeIndex].description}
                  </p>
                )}
              </div>

              <Link to="/products">
                <Button variant="hero" size="xl" className="bg-white text-gray-800 hover:bg-white/90 shadow-xl">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Scroll hint indicator (no buttons) */}
          {offers.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 text-white/70">
              <div className="flex gap-1.5">
                {offers.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/40 w-1.5'
                    }`}
                  />
                ))}
              </div>
              {/* Tear progress indicator */}
              {isTearing && (
                <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${tearProgress * 100}%`, transition: 'none' }}
                  />
                </div>
              )}
              {!isTearing && (
                <div className="text-xs font-medium animate-pulse">
                  Scroll to tear
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
