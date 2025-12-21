import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CreditCard, Lock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, taxTotal, discount, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Form refs for shipping address
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const pincodeRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discountAmount = (subtotal * discount) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please login to complete your purchase");
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Prepare Payload for Backend
      // The backend expects: { items: [{ product_id: int, quantity: int }], auto_invoice: bool, shipping_address: {...} }
      const orderPayload = {
        auto_invoice: true,
        items: items.map(item => ({
          // Ensure we parse the ID as integer (frontend IDs might be strings)
          product_id: parseInt(item.id.split('-')[0]), 
          quantity: item.quantity
        })),
        shipping_address: {
          name: `${firstNameRef.current?.value || ''} ${lastNameRef.current?.value || ''}`.trim(),
          address: addressRef.current?.value || '',
          city: cityRef.current?.value || '',
          state: stateRef.current?.value || '',
          pincode: pincodeRef.current?.value || '',
          phone: phoneRef.current?.value || '',
        }
      };

      // 2. Call API (Transactional Endpoint)
      const response = await api.post('/orders/', orderPayload);

      // Get order details from response
      const orderData = response.data;

      // Prepare order confirmation data
      const confirmationData = {
        orderId: orderData.order_id,
        orderNumber: orderData.order_number,
        total: orderData.total || total,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          firstName: firstNameRef.current?.value || '',
          lastName: lastNameRef.current?.value || '',
          address: addressRef.current?.value || '',
          city: cityRef.current?.value || '',
          state: stateRef.current?.value || '',
          pincode: pincodeRef.current?.value || '',
          phone: phoneRef.current?.value || '',
        },
      };

      toast.success('Order placed successfully! Inventory updated.');
      
      // Set flag to prevent redirect on cart clear
      setOrderComplete(true);
      clearCart();
      
      // Navigate to order confirmation page with order data
      navigate('/order-confirmation', { state: confirmationData, replace: true });
    } catch (error) {
      console.error("Checkout failed:", error);
      
      // Handle Specific Backend Errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const msg = error.response?.data?.detail || "Payment failed";

        if (status === 409) {
          toast.error("Stock changed while you were buying. Please retry.");
        } else if (status === 400) {
          toast.error(`Order failed: ${msg}`);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | ApparelDesk</title>
      </Helmet>
      <Layout>
        <div className="bg-muted/30 py-8 lg:py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              Checkout
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Form */}
              <div className="flex-1 space-y-8">
                {/* Contact */}
                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <h2 className="font-display text-lg font-semibold mb-4">Contact Information</h2>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ''}
                        placeholder="your@email.com"
                        required
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+91 98765 43210" required ref={phoneRef} />
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <h2 className="font-display text-lg font-semibold mb-4">Shipping Address</h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" required ref={firstNameRef} />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" required ref={lastNameRef} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="Street address" required ref={addressRef} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" required ref={cityRef} />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" required ref={stateRef} />
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input id="pincode" required ref={pincodeRef} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold">Payment</h2>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" required />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Your payment information is secure</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-96">
                <div className="bg-card rounded-lg p-6 shadow-soft sticky top-24">
                  <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
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
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 text-sm border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">{formatPrice(taxTotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount ({discount}%)</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-primary">Free</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full mt-6"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing Transaction...' : `Pay ${formatPrice(total)}`}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
};

export default Checkout;