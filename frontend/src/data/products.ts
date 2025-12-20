import productMensShirt from '@/assets/product-mens-shirt.jpg';
import productKurta from '@/assets/product-kurta.jpg';
import productWomensDress from '@/assets/product-womens-dress.jpg';
import productJacket from '@/assets/product-jacket.jpg';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tax: number;
  category: 'men' | 'women' | 'children';
  type: 'shirts' | 'pants' | 'kurtas' | 'dresses' | 'jackets';
  material: 'cotton' | 'silk' | 'linen' | 'wool' | 'polyester';
  colors: string[];
  sizes: string[];
  stock: number;
  images: string[];
  featured: boolean;
  published: boolean;
}

const PLACEHOLDER_IMG = 'https://placehold.co/600x800/e2e8f0/1e293b?text=Product+Image';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Cotton Shirt',
    description: 'A timeless cotton shirt perfect for any occasion. Features a relaxed fit with premium quality fabric.',
    price: 2499,
    tax: 450,
    category: 'men',
    type: 'shirts',
    material: 'cotton',
    colors: ['White', 'Blue', 'Beige'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 50,
    images: [productMensShirt],
    featured: true,
    published: true,
  },
  {
    id: '2',
    name: 'Silk Blend Kurta',
    description: 'Elegant silk blend kurta with intricate embroidery. Perfect for festive occasions.',
    price: 4999,
    tax: 900,
    category: 'men',
    type: 'kurtas',
    material: 'silk',
    colors: ['Maroon', 'Navy', 'Gold'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 30,
    images: [productKurta],
    featured: true,
    published: true,
  },
  {
    id: '3',
    name: 'Linen Summer Dress',
    description: 'Light and breezy linen dress ideal for summer days. Features a flattering A-line cut.',
    price: 3499,
    tax: 630,
    category: 'women',
    type: 'dresses',
    material: 'linen',
    colors: ['White', 'Blush', 'Sage'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 40,
    images: [productWomensDress],
    featured: true,
    published: true,
  },
  {
    id: '4',
    name: 'Cotton Chinos',
    description: 'Versatile cotton chinos with a modern slim fit. Perfect for casual and semi-formal wear.',
    price: 2999,
    tax: 540,
    category: 'men',
    type: 'pants',
    material: 'cotton',
    colors: ['Khaki', 'Navy', 'Olive'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 60,
    images: ['/placeholder.svg'],
    featured: false,
    published: true,
  },
  {
    id: '5',
    name: 'Wool Blend Jacket',
    description: 'Premium wool blend jacket with a tailored fit. Adds sophistication to any outfit.',
    price: 7999,
    tax: 1440,
    category: 'men',
    type: 'jackets',
    material: 'wool',
    colors: ['Charcoal', 'Brown', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    images: [productJacket],
    featured: true,
    published: true,
  },
  {
    id: '6',
    name: 'Silk Saree Blouse',
    description: 'Beautifully crafted silk blouse with traditional design elements.',
    price: 1999,
    tax: 360,
    category: 'women',
    type: 'shirts',
    material: 'silk',
    colors: ['Red', 'Green', 'Purple'],
    sizes: ['S', 'M', 'L'],
    stock: 45,
    images: ['/placeholder.svg'],
    featured: false,
    published: true,
  },
  {
    id: '7',
    name: 'Kids Cotton T-Shirt',
    description: 'Comfortable and durable cotton t-shirt for active kids.',
    price: 799,
    tax: 144,
    category: 'children',
    type: 'shirts',
    material: 'cotton',
    colors: ['Yellow', 'Blue', 'Red', 'Green'],
    sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    stock: 100,
    images: ['/placeholder.svg'],
    featured: false,
    published: true,
  },
  {
    id: '8',
    name: 'Women\'s Linen Pants',
    description: 'Relaxed fit linen pants perfect for warm weather styling.',
    price: 2799,
    tax: 504,
    category: 'women',
    type: 'pants',
    material: 'linen',
    colors: ['White', 'Beige', 'Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 55,
    images: ['/placeholder.svg'],
    featured: true,
    published: true,
  },
];

export const categories = [
  { id: 'men', name: 'Men', image: '/placeholder.svg' },
  { id: 'women', name: 'Women', image: '/placeholder.svg' },
  { id: 'children', name: 'Children', image: '/placeholder.svg' },
];

export const productTypes = ['shirts', 'pants', 'kurtas', 'dresses', 'jackets'];
export const materials = ['cotton', 'silk', 'linen', 'wool', 'polyester'];
