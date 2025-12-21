import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center bg-gradient-to-br from-brown-700 via-brown-600 to-brown-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-block text-brown-200 text-sm font-medium tracking-widest uppercase mb-4 animate-fade-in">
            New Collection 2024
          </span>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl text-primary-foreground font-bold leading-tight mb-6 animate-slide-up">
            Elevate Your
            <br />
            <span className="text-brown-200">Everyday Style</span>
          </h1>
          
          <p className="text-primary-foreground/80 text-lg lg:text-xl max-w-xl mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Discover our curated collection of premium clothing designed for comfort, 
            quality, and timeless elegance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/products">
              <Button variant="hero" size="xl" className="gap-2 bg-cream text-brown-800 hover:bg-cream/90">
                Shop Collection
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products?category=women">
              <Button variant="hero-outline" size="xl">
                Women's Wear
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div>
              <div className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground">50+</div>
              <div className="text-primary-foreground/60 text-sm mt-1">Products</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground">10k+</div>
              <div className="text-primary-foreground/60 text-sm mt-1">Customers</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground">4.9</div>
              <div className="text-primary-foreground/60 text-sm mt-1">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Elegant Visual */}
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
        {/* Gradient overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-brown-700 via-brown-700/60 to-brown-600/30 z-10" />
        
        {/* Single Hero Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1600&fit=crop" 
            alt="Fashion collection"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {/* Circular frame accent */}
          <div className="relative">
            {/* Outer ring */}
            <div className="w-72 h-72 rounded-full border-2 border-cream/20 absolute -top-36 -left-36" />
            <div className="w-96 h-96 rounded-full border border-cream/10 absolute -top-48 -left-48" />
            
            {/* Feature badge */}
            <div className="absolute right-12 top-1/4 bg-cream/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="text-brown-800 font-display text-lg font-bold">New Arrivals</div>
              <div className="text-brown-600 text-sm mt-1">Winter Collection</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-brown-600 text-xs">In Stock</span>
              </div>
            </div>
            
            {/* Discount tag */}
            <div className="absolute right-24 bottom-1/4 bg-brown-800/90 backdrop-blur-sm text-cream rounded-xl px-5 py-3 shadow-xl">
              <div className="text-2xl font-display font-bold">30% OFF</div>
              <div className="text-cream/70 text-xs">First Purchase</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
