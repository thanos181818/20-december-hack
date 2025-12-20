import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  invoiceId: string | null;
  items: OrderItem[];
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/order/${id}`);
        const data = res.data;
        
        setOrder({
          id: data.id.toString(),
          orderNumber: data.order_number,
          date: data.order_date || new Date().toISOString().split('T')[0],
          status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
          total: data.total_amount,
          subtotal: data.total_amount * 0.85,
          tax: data.total_amount * 0.15,
          discount: data.discount_amount || 0,
          customerName: data.customer_name || 'Customer',
          customerEmail: data.customer_email || '',
          customerPhone: data.customer_phone || '',
          customerAddress: data.customer_address || '',
          invoiceId: data.invoice_id?.toString() || null,
          items: data.items || [],
        });
      } catch (error) {
        console.error('Failed to fetch order', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <>
        <Helmet>
          <title>Order Not Found | ApparelDesk</title>
        </Helmet>
        <Layout>
          <div className="container mx-auto px-4 py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The order you're looking for doesn't exist.
            </p>
            <Link to="/dashboard">
              <Button variant="default">Back to Dashboard</Button>
            </Link>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Order ${order.orderNumber} | ApparelDesk`}</title>
      </Helmet>
      <Layout>
        <div className="bg-muted/30 py-8 lg:py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                  Order {order.orderNumber}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="font-medium">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="font-display text-lg font-semibold">Order Items</h2>
                </div>
                <div className="divide-y divide-border">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-6 flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product_id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          {formatPrice(item.total)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(item.unit_price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-card rounded-lg shadow-soft p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Customer Information</h2>
                <div className="text-foreground space-y-2">
                  <p className="font-medium">{order.customerName}</p>
                  {order.customerEmail && (
                    <p className="text-muted-foreground">{order.customerEmail}</p>
                  )}
                  {order.customerPhone && (
                    <p className="text-muted-foreground">{order.customerPhone}</p>
                  )}
                  {order.customerAddress && (
                    <p className="text-muted-foreground">{order.customerAddress}</p>
                  )}
                  {!order.customerAddress && !order.customerPhone && (
                    <p className="text-muted-foreground italic">Update your profile to add address and phone</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-card rounded-lg shadow-soft p-6 sticky top-24">
                <h2 className="font-display text-lg font-semibold mb-6">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatPrice(order.tax)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-primary">Free</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {order.invoiceId && (
                    <Link to={`/invoice/${order.invoiceId}`}>
                      <Button variant="outline" className="w-full">
                        View Invoice
                      </Button>
                    </Link>
                  )}
                  <Link to="/products">
                    <Button variant="ghost" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default OrderDetail;
