import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PromoSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative bg-gradient-to-br from-brown-600 to-brown-800 rounded-2xl overflow-hidden">
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }} />
          </div>

          <div className="relative p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brown-500/30 text-brown-100 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Ticket className="h-4 w-4" />
                Limited Time Offer
              </div>
              <h2 className="font-display text-3xl lg:text-5xl font-bold text-primary-foreground mb-4">
                Get 20% Off
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-md mb-2">
                Use code <span className="font-semibold text-brown-200">SAVE20</span> at checkout
              </p>
              <p className="text-primary-foreground/60 text-sm">
                Valid on orders above ₹2,000. Limited time only.
              </p>
            </div>

            <Link to="/products">
              <Button variant="hero" size="xl" className="bg-cream text-brown-800 hover:bg-cream/90">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
