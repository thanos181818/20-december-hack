import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-bold">ApparelDesk</span>
            </Link>
            <p className="mt-4 text-primary-foreground/70 text-sm leading-relaxed">
              Premium clothing for the modern lifestyle. Quality craftsmanship meets contemporary design.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products?category=men" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/products?category=women" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/products?category=children" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Children
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-primary-foreground/70 text-sm">Contact Us</span>
              </li>
              <li>
                <span className="text-primary-foreground/70 text-sm">Shipping Policy</span>
              </li>
              <li>
                <span className="text-primary-foreground/70 text-sm">Returns & Exchanges</span>
              </li>
              <li>
                <span className="text-primary-foreground/70 text-sm">FAQs</span>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">My Account</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 ApparelDesk. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-primary-foreground/60 text-sm">Privacy Policy</span>
            <span className="text-primary-foreground/60 text-sm">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
