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

const BillPayment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vendorBills, updateVendorBill } = useAdminData();
  
  const billId = id || searchParams.get('billId');
  const bill = vendorBills.find(b => b.id === billId);
  
  const [status, setStatus] = useState<'draft' | 'confirmed' | 'cancelled'>('draft');
  const [formData, setFormData] = useState({
    paymentType: 'send',
    partnerType: 'vendor',
    partner: bill?.vendor || '',
    amount: bill ? bill.total - bill.paid : 0,
    date: new Date().toISOString().split('T')[0],
    note: bill?.billNumber || '',
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        paymentType: 'send',
        partnerType: 'vendor',
        partner: bill.vendor,
        amount: bill.total - bill.paid,
        date: new Date().toISOString().split('T')[0],
        note: bill.billNumber,
      });
    }
  }, [bill]);

  if (!bill) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Bill not found</p>
        </div>
      </AdminLayout>
    );
  }

  const handleConfirm = () => {
    if (formData.amount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    const newPaid = bill.paid + formData.amount;
    // Map to backend InvoiceStatus: 'paid', 'partial', or 'confirmed' (no payment yet)
    const newStatus = newPaid >= bill.total ? 'paid' : newPaid > 0 ? 'partial' : 'confirmed';
    
    updateVendorBill(bill.id, {
      paid: newPaid,
      status: newStatus,
    });

    toast.success('Payment confirmed successfully');
    setStatus('confirmed');
  };

  const handlePrint = () => {
    toast.success('Preparing payment receipt for print...');
    window.print();
  };

  const handleSend = () => {
    toast.success('Payment receipt sent to vendor');
  };

  const handleCancel = () => {
    setStatus('cancelled');
    toast.success('Payment cancelled');
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Bill Payment | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/billing')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Bill Payment</h1>
              <p className="text-sm text-muted-foreground">Pay/25/0002</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
        <div className="flex flex-wrap gap-2">
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

        {/* Payment Form and Bill Summary - Side by Side on Large Screens */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <Input
                    value="Send"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Partner Type</Label>
                  <Input
                    value="Vendor"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    disabled={status !== 'draft'}
                    placeholder="Auto-filled from bill"
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
                <Label>Partner</Label>
                <Input
                  value={formData.partner}
                  disabled
                  className="bg-muted"
                  placeholder="Auto-filled from bill"
                />
              </div>

              <div>
                <Label>Note</Label>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  disabled={status !== 'draft'}
                  placeholder="Default: Invoice or bill number"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bill Summary - Takes 1 column */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill Number:</span>
                <span className="font-medium">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">₹{bill.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-medium text-green-600">₹{bill.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="font-semibold">Remaining:</span>
                <span className="font-semibold text-red-600">₹{(bill.total - bill.paid).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BillPayment;
