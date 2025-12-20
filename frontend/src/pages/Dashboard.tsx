import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, FileText, User, LogOut, Download, TrendingUp, Eye } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for demo
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'Delivered',
    total: 5998,
    items: 2,
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'Processing',
    total: 2499,
    items: 1,
  },
];

const mockInvoices = [
  {
    id: 'INV-001',
    orderId: 'ORD-001',
    date: '2024-01-15',
    total: 5998,
  },
  {
    id: 'INV-002',
    orderId: 'ORD-002',
    date: '2024-01-10',
    total: 2499,
  },
];

type Tab = 'orders' | 'invoices' | 'profile';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');

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

  const tabs = [
    { id: 'orders' as Tab, label: 'My Orders', icon: Package },
    { id: 'invoices' as Tab, label: 'Invoices', icon: FileText },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

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
              <Link to="/sales">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Sales Report
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-card rounded-lg p-4 shadow-soft space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1">
              {activeTab === 'orders' && (
                <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-display text-xl font-semibold">Order History</h2>
                  </div>
                  {mockOrders.length > 0 ? (
                    <div className="divide-y divide-border">
                      {mockOrders.map(order => (
                        <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-foreground">{order.id}</span>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded ${
                                  order.status === 'Delivered'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.items} items • {order.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-foreground">{formatPrice(order.total)}</div>
                            </div>
                            <Link to={`/order/${order.id}`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-display text-xl font-semibold">Invoices</h2>
                  </div>
                  {mockInvoices.length > 0 ? (
                    <div className="divide-y divide-border">
                      {mockInvoices.map(invoice => (
                        <div key={invoice.id} className="p-6 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">{invoice.id}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Order: {invoice.orderId} • {invoice.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="font-semibold text-foreground">{formatPrice(invoice.total)}</div>
                            <Link to={`/invoice/${invoice.id}`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No invoices yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="bg-card rounded-lg shadow-soft p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Name</label>
                      <p className="font-medium text-foreground mt-1">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium text-foreground mt-1">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
