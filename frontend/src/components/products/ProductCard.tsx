import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      tax: product.tax,
      quantity: 1,
      image: product.images[0],
      size: product.sizes[0],
      color: product.colors[0],
    });
    toast.success(`${product.name} added to cart`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover-lift">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Quick Add Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded capitalize">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground capitalize mt-1">
                {product.material} • {product.type}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              + {formatPrice(product.tax)} tax
            </span>
          </div>

          {/* Color Options */}
          <div className="mt-3 flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="w-4 h-4 rounded-full border border-border"
                style={{
                  backgroundColor:
                    color.toLowerCase() === 'white'
                      ? '#ffffff'
                      : color.toLowerCase() === 'black'
                      ? '#1a1a1a'
                      : color.toLowerCase() === 'blue'
                      ? '#3b82f6'
                      : color.toLowerCase() === 'beige'
                      ? '#d4b896'
                      : color.toLowerCase() === 'maroon'
                      ? '#800000'
                      : color.toLowerCase() === 'navy'
                      ? '#000080'
                      : color.toLowerCase() === 'gold'
                      ? '#ffd700'
                      : color.toLowerCase() === 'blush'
                      ? '#de5d83'
                      : color.toLowerCase() === 'sage'
                      ? '#9dc183'
                      : color.toLowerCase() === 'khaki'
                      ? '#c3b091'
                      : color.toLowerCase() === 'olive'
                      ? '#808000'
                      : color.toLowerCase() === 'charcoal'
                      ? '#36454f'
                      : color.toLowerCase() === 'brown'
                      ? '#8b4513'
                      : color.toLowerCase() === 'red'
                      ? '#dc2626'
                      : color.toLowerCase() === 'green'
                      ? '#16a34a'
                      : color.toLowerCase() === 'purple'
                      ? '#9333ea'
                      : color.toLowerCase() === 'yellow'
                      ? '#eab308'
                      : '#888888',
                }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
