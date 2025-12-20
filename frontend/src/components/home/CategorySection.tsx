import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import images
import mensShirt from '@/assets/product-mens-shirt.jpg';
import womensDress from '@/assets/product-womens-dress.jpg';
import kidsImage from '@/assets/product-kurta.jpg';

const categories = [
  {
    id: 'men',
    name: 'Men',
    description: 'Timeless pieces for the modern gentleman',
    longDescription: 'Discover our collection of refined menswear, from tailored suits to casual essentials. Quality craftsmanship meets contemporary style.',
    image: mensShirt,
    color: 'from-slate-800 via-slate-700 to-slate-900',
  },
  {
    id: 'women',
    name: 'Women',
    description: 'Elegant styles for every occasion',
    longDescription: 'Explore sophisticated silhouettes and timeless elegance. From designer pieces to everyday essentials, find your perfect look.',
    image: womensDress,
    color: 'from-rose-800 via-rose-700 to-rose-900',
  },
  {
    id: 'children',
    name: 'Children',
    description: 'Comfortable & playful designs',
    longDescription: 'Fun, comfortable, and durable clothing for your little ones. Bright colors and playful designs they will love to wear.',
    image: kidsImage,
    color: 'from-amber-700 via-amber-600 to-amber-800',
  },
];

const CategorySection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our carefully curated collections designed for every member of your family
          </p>
        </div>

        {/* Horizontal Expanding Tabs */}
        <div className="flex gap-2 lg:gap-4 h-[500px] lg:h-[600px]">
          {categories.map((category, index) => {
            const isActive = index === activeIndex;
            
            return (
              <div
                key={category.id}
                onClick={() => setActiveIndex(index)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out ${
                  isActive ? 'flex-[7]' : 'flex-[1.5]'
                }`}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isActive ? 'scale-100' : 'scale-110'
                    }`}
                  />
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} transition-opacity duration-500 ${
                    isActive ? 'opacity-60' : 'opacity-80'
                  }`} />
                </div>

                {/* Collapsed State - Vertical Text */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  <div className="transform -rotate-90 whitespace-nowrap">
                    <h3 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-wider">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Expanded State - Full Content */}
                <div className={`absolute inset-0 flex flex-col justify-between p-6 lg:p-10 transition-all duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                  {/* Top Badge */}
                  <div className="flex justify-between items-start">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                      {category.name}'s Collection
                    </span>
                    <span className="text-white/60 text-sm font-medium">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Bottom Content */}
                  <div className="space-y-4">
                    <h3 className="font-display text-4xl lg:text-6xl font-bold text-white">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-base lg:text-lg max-w-md leading-relaxed">
                      {category.longDescription}
                    </p>
                    <Link to={`/products?category=${category.id}`}>
                      <Button 
                        variant="hero" 
                        size="lg"
                        className="mt-4 bg-white text-gray-900 hover:bg-white/90 group"
                      >
                        <span>Explore Collection</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Hover indicator for collapsed tabs */}
                {!isActive && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-1 bg-white/40 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile indicator dots */}
        <div className="flex justify-center gap-2 mt-6 lg:hidden">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
