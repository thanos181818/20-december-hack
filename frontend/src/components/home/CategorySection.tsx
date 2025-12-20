import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'men',
    name: 'Men',
    description: 'Timeless pieces for the modern gentleman',
    image: '/placeholder.svg',
  },
  {
    id: 'women',
    name: 'Women',
    description: 'Elegant styles for every occasion',
    image: '/placeholder.svg',
  },
  {
    id: 'children',
    name: 'Children',
    description: 'Comfortable & playful designs',
    image: '/placeholder.svg',
  },
];

const CategorySection = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-muted animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-brown-400/40 to-brown-700/80 transition-all duration-500 group-hover:from-brown-400/50 group-hover:to-brown-800/90" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">
                  {category.name}
                </h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  {category.description}
                </p>
                <div className="flex items-center gap-2 text-primary-foreground font-medium text-sm group-hover:gap-3 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
