import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>ApparelDesk - Premium Clothing for Everyone</title>
        <meta 
          name="description" 
          content="Discover premium clothing at ApparelDesk. Shop the latest collection of men's, women's, and children's apparel with quality craftsmanship and timeless style." 
        />
      </Helmet>
      <Layout>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <PromoSection />
      </Layout>
    </>
  );
};

export default Index;
