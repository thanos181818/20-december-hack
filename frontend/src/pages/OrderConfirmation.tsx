import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, FileText, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface OrderConfirmationState {
  orderId: number;
  orderNumber: string;
  total: number;
  items: OrderItem[];
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state as OrderConfirmationState | null;

  useEffect(() => {
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const deliveryDateString = estimatedDelivery.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Helmet>
        <title>Order Confirmed | ApparelDesk</title>
      </Helmet>
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Side - Thank You Message */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                      Thank You for Your Order!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Order #{orderData.orderNumber}
                    </p>
                  </div>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Estimated Delivery</h3>
                          <p className="text-muted-foreground text-sm">
                            {deliveryDateString}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Order Confirmation</h3>
                          <p className="text-muted-foreground text-sm">
                            A confirmation email has been sent to your registered email address.
                          </p>
                        </div>
                      </div>

                      {orderData.shippingAddress && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-medium mb-2">Shipping Address</h3>
                            <p className="text-muted-foreground text-sm">
                              {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                              <br />
                              {orderData.shippingAddress.address}
                              <br />
                              {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode}
                              <br />
                              Phone: {orderData.shippingAddress.phone}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/dashboard" className="flex-1">
                    <Button variant="default" className="w-full gap-2">
                      <Package className="h-4 w-4" />
                      View My Orders
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Home className="h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                </div>

                <Link to="/products" className="block">
                  <Button variant="ghost" className="w-full gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Right Side - Order Summary */}
              <div>
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

                    {/* Items */}
                    <div className="space-y-4 mb-6">
                      {orderData.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(orderData.total * 0.85)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (18%)</span>
                        <span>{formatPrice(orderData.total * 0.15)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Paid</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(orderData.total)}
                      </span>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Payment Successful</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Your payment has been processed successfully.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default OrderConfirmation;
