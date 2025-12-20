import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (isAuthenticated && isAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(formData.email, formData.password, 'admin');

      if (success) {
        toast.success('Welcome back!');
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials. Please try again.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | ApparelDesk</title>
      </Helmet>
      <div className="min-h-screen flex">
        {/* Left Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-block mb-8">
              <span className="font-display text-2xl font-bold text-primary">ApparelDesk</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium ml-2">Admin</span>
            </Link>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground mb-8">
              Access the admin dashboard to manage your store
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@appareldesk.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Are you a customer?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Customer Login
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Admin accounts are managed by the system administrator.
            </p>
          </div>
        </div>

        {/* Right Panel - Decorative */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="max-w-lg text-center">
            <ShieldCheck className="h-16 w-16 text-white/80 mx-auto mb-6" />
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Admin Dashboard
            </h2>
            <p className="text-white/80 text-lg">
              Manage products, orders, customers, and reports all in one place.
              Take control of your ApparelDesk store.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

