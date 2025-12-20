import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Printer, Send, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminData } from '@/contexts/AdminDataContext';
import { toast } from 'sonner';

const VendorBillView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vendorBills, contacts } = useAdminData();
  
  const bill = vendorBills.find(b => b.id === id);

  if (!bill) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Vendor bill not found</p>
        </div>
      </AdminLayout>
    );
  }

  const vendor = contacts.find(c => c.id === bill.vendorId);

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    toast.success(`Bill sent to ${vendor?.email || vendor?.name || 'vendor'}`);
  };

  const handlePay = () => {
    navigate(`/admin/billing/bill-payment/${bill.id}`);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Bill {bill.billNumber} | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6 max-w-5xl">
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
              <h1 className="font-display text-2xl font-bold text-foreground">
                Vendor Bill {bill.billNumber}
              </h1>
              <p className="text-sm text-muted-foreground">
                {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleSend} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
            {bill.status !== 'paid' && (
              <Button onClick={handlePay} className="gap-2">
                <Wallet className="h-4 w-4" />
                Pay
              </Button>
            )}
          </div>
        </div>

        {/* Bill Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill Number:</span>
                <span className="font-medium">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill Date:</span>
                <span className="font-medium">{bill.billDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">{bill.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                  bill.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {bill.status}
                </span>
              </div>
              {bill.purchaseOrderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Order:</span>
                  <span className="font-medium">{bill.purchaseOrderId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-muted-foreground block">Name:</span>
                <span className="font-medium">{vendor?.name || bill.vendor}</span>
              </div>
              {vendor?.email && (
                <div>
                  <span className="text-muted-foreground block">Email:</span>
                  <span className="font-medium">{vendor.email}</span>
                </div>
              )}
              {vendor?.phone && (
                <div>
                  <span className="text-muted-foreground block">Phone:</span>
                  <span className="font-medium">{vendor.phone}</span>
                </div>
              )}
              {vendor?.address && (
                <div>
                  <span className="text-muted-foreground block">Address:</span>
                  <span className="font-medium">{vendor.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.tax}%</TableCell>
                    <TableCell className="text-right font-medium">₹{item.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="flex justify-end">
          <Card className="w-full md:w-96">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹{bill.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">₹{bill.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total:</span>
                <span>₹{bill.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Paid:</span>
                <span className="font-medium text-green-600">₹{bill.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Balance Due:</span>
                <span className="text-red-600">₹{(bill.total - bill.paid).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VendorBillView;
