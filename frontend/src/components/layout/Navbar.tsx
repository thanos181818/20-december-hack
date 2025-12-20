import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-display text-2xl lg:text-3xl font-bold text-primary tracking-tight">
              ApparelDesk
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/products"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              All Products
            </Link>
            <Link
              to="/products?category=men"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Men
            </Link>
            <Link
              to="/products?category=women"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Women
            </Link>
            <Link
              to="/products?category=children"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Children
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" className="hidden lg:flex">
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-4">
                {isAdmin ? (
                  <Link to="/admin">
                    <Button variant="ghost" className="gap-2">
                      <Shield className="h-5 w-5" />
                      <span className="hidden xl:inline">Admin Panel</span>
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button variant="ghost" className="gap-2">
                      <User className="h-5 w-5" />
                      <span className="hidden xl:inline">{user?.name}</span>
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={logout} className="text-muted-foreground">
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden lg:block">
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link
                to="/products"
                className="px-4 py-3 text-foreground/80 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              <Link
                to="/products?category=men"
                className="px-4 py-3 text-foreground/80 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                to="/products?category=women"
                className="px-4 py-3 text-foreground/80 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Women
              </Link>
              <Link
                to="/products?category=children"
                className="px-4 py-3 text-foreground/80 hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Children
              </Link>
              <div className="border-t border-border my-2" />
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="px-4 py-3 text-foreground/80 hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="px-4 py-3 text-foreground/80 hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left text-muted-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-3 text-foreground/80 hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
