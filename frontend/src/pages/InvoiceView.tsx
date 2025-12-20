import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Download, FileText, Printer } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  orderId: string;
  date: string;
  dueDate: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  billingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    email: string;
    phone: string;
  };
  items: {
    productId: string;
    description: string;
    quantity: number;
    price: number;
    tax: number;
  }[];
}

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // Try to fetch invoice from backend
        const res = await api.get(`/orders/invoice/${id}`);
        const data = res.data;
        
        setInvoice({
          id: data.id.toString(),
          invoiceNumber: data.invoice_number,
          orderId: data.sale_order_id?.toString() || '',
          date: data.invoice_date,
          dueDate: data.due_date || data.invoice_date,
          status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
          subtotal: data.total_amount * 0.85,
          tax: data.total_amount * 0.15,
          discount: 0,
          total: data.total_amount,
          billingAddress: {
            name: data.customer_name || 'Customer',
            address: data.customer_address || 'Address not provided',
            city: 'City',
            state: 'State',
            pincode: '000000',
            email: data.customer_email || '',
            phone: data.customer_phone || '',
          },
          items: data.items || [
            {
              productId: '1',
              description: 'Order Items',
              quantity: 1,
              price: data.total_amount * 0.85,
              tax: data.total_amount * 0.15,
            }
          ],
        });
      } catch (error) {
        console.error('Failed to fetch invoice', error);
        // Fallback to mock data for demo
        setInvoice({
          id: id || 'INV-001',
          invoiceNumber: id || 'INV-001',
          orderId: 'ORD-001',
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          status: 'Paid',
          subtotal: 2499,
          tax: 450,
          discount: 0,
          total: 2949,
          billingAddress: {
            name: 'Customer',
            address: 'Address',
            city: 'City',
            state: 'State',
            pincode: '000000',
            email: 'customer@email.com',
            phone: '+91 98765 43210',
          },
          items: [
            { productId: '1', description: 'Product Item', quantity: 1, price: 2499, tax: 450 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('PDF download would be triggered here. In production, use a library like jsPDF.');
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

  if (!invoice) {
    return (
      <>
        <Helmet>
          <title>Invoice Not Found | ApparelDesk</title>
        </Helmet>
        <Layout>
          <div className="container mx-auto px-4 py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold mb-4">Invoice Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The invoice you're looking for doesn't exist.
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
        <title>{`Invoice ${invoice.invoiceNumber} | ApparelDesk`}</title>
      </Helmet>
      <Layout>
        <div className="bg-muted/30 py-8 lg:py-12 print:hidden">
          <div className="container mx-auto px-4 lg:px-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Invoice {invoice.invoiceNumber}
              </h1>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="default" onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Invoice Document */}
            <div className="bg-card rounded-lg shadow-soft p-8 lg:p-12 print:shadow-none">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b border-border">
                <div>
                  <h2 className="font-display text-2xl font-bold text-primary">ApparelDesk</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    123 Fashion Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-bold text-foreground">INVOICE</div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Invoice #:</span> <span className="font-medium">{invoice.invoiceNumber}</span></p>
                    <p><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(invoice.date).toLocaleDateString('en-IN')}</span></p>
                    {invoice.orderId && <p><span className="text-muted-foreground">Order #:</span> <span className="font-medium">{invoice.orderId}</span></p>}
                  </div>
                  <div className={`inline-flex mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.status.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {invoice.status}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="py-8 border-b border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Bill To</h3>
                <div className="text-foreground">
                  <p className="font-medium">{invoice.billingAddress.name}</p>
                  <p className="text-muted-foreground mt-1">
                    {invoice.billingAddress.address}<br />
                    {invoice.billingAddress.city}, {invoice.billingAddress.state} {invoice.billingAddress.pincode}<br />
                    {invoice.billingAddress.email}<br />
                    {invoice.billingAddress.phone}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                      <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Qty</th>
                      <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                      <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tax</th>
                      <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4">
                          <div className="font-medium text-foreground">{item.description}</div>
                        </td>
                        <td className="py-4 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="py-4 text-right text-muted-foreground">{formatPrice(item.price)}</td>
                        <td className="py-4 text-right text-muted-foreground">{formatPrice(item.tax)}</td>
                        <td className="py-4 text-right font-medium text-foreground">
                          {formatPrice((item.price + item.tax) * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (GST)</span>
                      <span className="font-medium">{formatPrice(invoice.tax)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Discount</span>
                        <span>-{formatPrice(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                <p>Thank you for shopping with ApparelDesk!</p>
                <p className="mt-1">For any questions, contact us at support@appareldesk.com</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default InvoiceView;
