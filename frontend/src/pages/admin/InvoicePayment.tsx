import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminData } from '@/contexts/AdminDataContext';
import { toast } from 'sonner';

const InvoicePayment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { invoices, updateInvoice, paymentTerms } = useAdminData();
  
  const invoiceId = id || searchParams.get('invoiceId');
  const invoice = invoices.find(inv => inv.id === invoiceId);
  
  const [status, setStatus] = useState<'draft' | 'confirmed' | 'cancelled'>('draft');
  const [formData, setFormData] = useState({
    paymentType: 'receive',
    partnerType: 'customer',
    partner: invoice?.customer || '',
    amount: invoice ? invoice.total - invoice.paid : 0,
    date: new Date().toISOString().split('T')[0],
    note: invoice?.invoiceNumber || '',
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        paymentType: 'receive',
        partnerType: 'customer',
        partner: invoice.customer,
        amount: invoice.total - invoice.paid,
        date: new Date().toISOString().split('T')[0],
        note: invoice.invoiceNumber,
      });
    }
  }, [invoice]);

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Invoice not found</p>
        </div>
      </AdminLayout>
    );
  }

  // Check if early payment discount applies
  const paymentTerm = paymentTerms.find(pt => pt.id === invoice.paymentTerm);
  const earlyDiscountMessage = paymentTerm?.earlyPaymentDiscount 
    ? `Early payment discount of ${paymentTerm.discountPercentage}% has been applied`
    : null;

  const handleConfirm = () => {
    if (formData.amount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    const newPaid = invoice.paid + formData.amount;
    const newStatus = newPaid >= invoice.total ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
    
    updateInvoice(invoice.id, {
      paid: newPaid,
      status: newStatus,
      paidDate: newPaid >= invoice.total ? formData.date : undefined,
    });

    toast.success('Payment confirmed successfully');
    setStatus('confirmed');
  };

  const handlePrint = () => {
    toast.success('Preparing payment receipt for print...');
    window.print();
  };

  const handleSend = () => {
    toast.success('Payment receipt sent to customer');
  };

  const handleCancel = () => {
    setStatus('cancelled');
    toast.success('Payment cancelled');
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Invoice Payment | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/billing')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Invoice Payment</h1>
              <p className="text-sm text-muted-foreground">Pay/25/0002</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={status === 'draft' ? 'default' : 'outline'}
              size="sm"
              disabled={status !== 'draft'}
            >
              Draft
            </Button>
            <Button
              variant={status === 'confirmed' ? 'default' : 'outline'}
              size="sm"
              disabled={status !== 'confirmed'}
            >
              Confirmed
            </Button>
            <Button
              variant={status === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              disabled={status !== 'cancelled'}
            >
              Cancelled
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleConfirm}
            disabled={status !== 'draft'}
          >
            Confirm
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSend}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={status === 'cancelled'}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Early Payment Discount Message */}
        {earlyDiscountMessage && (
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-700">{earlyDiscountMessage}</p>
          </div>
        )}

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Type</Label>
                <Input
                  value="Receive"
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Partner Type</Label>
                <Input
                  value="Customer"
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <Label>Partner</Label>
              <Input
                value={formData.partner}
                disabled
                className="bg-muted"
                placeholder="Auto-filled from invoice"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  disabled={status !== 'draft'}
                  placeholder="Auto-filled from invoice"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={status !== 'draft'}
                  placeholder="Default: Today's date"
                />
              </div>
            </div>

            <div>
              <Label>Note</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                disabled={status !== 'draft'}
                placeholder="Default: Invoice or bill number"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Number:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium">₹{invoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-medium text-green-600">₹{invoice.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Remaining:</span>
              <span className="font-semibold text-red-600">₹{(invoice.total - invoice.paid).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default InvoicePayment;
