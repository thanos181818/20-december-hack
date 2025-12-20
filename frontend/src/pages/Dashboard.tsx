import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, FileText, User, LogOut, Download, Eye, Mail, Phone, MapPin, Lock, Save, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface OrderFromBackend {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  order_date?: string;
  created_at?: string;
}

interface InvoiceFromBackend {
  id: number;
  invoice_number: string;
  total_amount: number;
  status: string;
  invoice_date: string;
  sale_order_id?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  date: string;
  total: number;
  status: string;
}

type Tab = 'orders' | 'invoices' | 'profile';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile form state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's profile
        const profileRes = await api.get('/auth/profile');
        const profileData = profileRes.data;
        setProfile({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
        });
        
        // Fetch user's orders
        const ordersRes = await api.get('/orders/my-orders');
        const ordersData = ordersRes.data || [];
        
        const mappedOrders: Order[] = ordersData.map((o: OrderFromBackend) => ({
          id: o.id.toString(),
          orderNumber: o.order_number,
          date: o.order_date || o.created_at || new Date().toISOString().split('T')[0],
          status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
          total: o.total_amount,
          items: 1, // We can enhance this later
        }));
        
        setOrders(mappedOrders);

        // Fetch user's invoices
        const invoicesRes = await api.get('/orders/my-invoices');
        const invoicesData = invoicesRes.data || [];
        
        const mappedInvoices: Invoice[] = invoicesData.map((i: InvoiceFromBackend) => ({
          id: i.id.toString(),
          invoiceNumber: i.invoice_number,
          orderId: i.sale_order_id?.toString() || '',
          date: i.invoice_date,
          total: i.total_amount,
          status: i.status.charAt(0).toUpperCase() + i.status.slice(1),
        }));
        
        setInvoices(mappedInvoices);
      } catch (error) {
        console.error('Failed to fetch user data', error);
        // Don't show error, just use empty arrays
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      await api.put('/auth/profile', {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      console.error('Failed to update profile', error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      setChangingPassword(true);
      await api.post('/auth/change-password', {
        current_password: passwords.current,
        new_password: passwords.new,
      });
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: unknown) {
      console.error('Failed to change password', error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'orders' as Tab, label: 'My Orders', icon: Package, count: orders.length },
    { id: 'invoices' as Tab, label: 'Invoices', icon: FileText, count: invoices.length },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'pending':
      case 'draft':
        return 'bg-amber-100 text-amber-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Account | ApparelDesk</title>
      </Helmet>
      <Layout>
        <div className="bg-muted/30 py-8 lg:py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                  My Account
                </h1>
                <p className="text-muted-foreground mt-2">
                  Welcome back, {user?.name}!
                </p>
              </div>
              <Link to="/products">
                <Button variant="outline" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <Card>
                <CardContent className="p-4 space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                      </div>
                      {tab.count !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeTab === tab.id 
                            ? 'bg-primary-foreground/20 text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                  <Separator className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </CardContent>
              </Card>
            </aside>

            {/* Content */}
            <div className="flex-1">
              {loading ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
                      <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {activeTab === 'orders' && (
                    <Card>
                      <CardHeader className="border-b border-border">
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Order History
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {orders.length > 0 ? (
                          <div className="divide-y divide-border">
                            {orders.map(order => (
                              <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start gap-4">
                                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Package className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-foreground">{order.orderNumber}</span>
                                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {order.date}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 sm:gap-6">
                                  <div className="text-right">
                                    <div className="font-bold text-lg text-foreground">{formatPrice(order.total)}</div>
                                  </div>
                                  <Link to={`/order/${order.id}`}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <Eye className="h-4 w-4" />
                                      Details
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 text-center">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
                            <p className="text-muted-foreground mb-6">
                              Start shopping to see your orders here
                            </p>
                            <Link to="/products">
                              <Button>Browse Products</Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'invoices' && (
                    <Card>
                      <CardHeader className="border-b border-border">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Invoices
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {invoices.length > 0 ? (
                          <div className="divide-y divide-border">
                            {invoices.map(invoice => (
                              <div key={invoice.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start gap-4">
                                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-foreground">{invoice.invoiceNumber}</span>
                                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                                        {invoice.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {invoice.date}
                                      </span>
                                      {invoice.orderId && (
                                        <span className="flex items-center gap-1">
                                          <CreditCard className="h-3.5 w-3.5" />
                                          Order #{invoice.orderId}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 sm:gap-6">
                                  <div className="text-right">
                                    <div className="font-bold text-lg text-foreground">{formatPrice(invoice.total)}</div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Link to={`/invoice/${invoice.id}`}>
                                      <Button variant="outline" size="sm" className="gap-2">
                                        <Eye className="h-4 w-4" />
                                        View
                                      </Button>
                                    </Link>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 text-center">
                            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">No invoices yet</h3>
                            <p className="text-muted-foreground">
                              Your invoices will appear here after you place orders
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Profile Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-6 mb-6">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{profile.name || user?.name}</h3>
                              <p className="text-muted-foreground">Customer</p>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid sm:grid-cols-2 gap-4 pt-4">
                            <div>
                              <Label htmlFor="name">Full Name</Label>
                              <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="name"
                                  value={profile.name || user?.name || ''}
                                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="email"
                                  type="email"
                                  value={profile.email || user?.email || ''}
                                  className="pl-10"
                                  disabled
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="phone"
                                  value={profile.phone}
                                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                  className="pl-10"
                                  placeholder="+91 98765 43210"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="address">Address</Label>
                              <div className="relative mt-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="address"
                                  value={profile.address}
                                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                  className="pl-10"
                                  placeholder="Your address"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4">
                            <Button onClick={handleProfileSave} disabled={savingProfile} className="gap-2">
                              <Save className="h-4 w-4" />
                              {savingProfile ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Password Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={passwords.current}
                              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new-password">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="confirm-password">Confirm New Password</Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Password must be at least 8 characters long
                          </p>
                          <Button onClick={handlePasswordChange} disabled={changingPassword} variant="outline" className="gap-2">
                            <Lock className="h-4 w-4" />
                            {changingPassword ? 'Changing...' : 'Change Password'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
