import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Printer,
  Send,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

const PurchaseOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, contacts, products: adminProducts, addVendorBill } = useAdminData();
  const isEditing = !!id;
  const existingOrder = isEditing ? purchaseOrders.find(o => o.id === id) : null;
  
  const [formData, setFormData] = useState({
    vendor: existingOrder?.vendorId || '',
    date: existingOrder?.date || new Date().toISOString().split('T')[0],
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(existingOrder?.lineItems || []);

  useEffect(() => {
    if (existingOrder) {
      setFormData({
        vendor: existingOrder.vendorId,
        date: existingOrder.date,
      });
      setLineItems(existingOrder.lineItems);
    }
  }, [existingOrder]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        tax: 12,
        total: 0,
      },
    ]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items =>
      items.map(item => {
        if (item.id !== id) return item;
        
        const updated = { ...item, [field]: value };
        
        if (field === 'productId') {
          const product = adminProducts.find(p => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.unitPrice = product.purchasePrice;
            updated.tax = product.purchaseTax;
          }
        }
        
        // Recalculate total
        const subtotal = updated.quantity * updated.unitPrice;
        updated.total = subtotal + (subtotal * updated.tax / 100);
        
        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.tax / 100), 0);
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = (status: 'draft' | 'confirmed') => {
    if (!formData.vendor) {
      toast.error('Please select a vendor');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    const vendor = contacts.find(c => c.id === formData.vendor);
    if (!vendor) {
      toast.error('Vendor not found');
      return;
    }

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.tax / 100), 0);
    const total = subtotal + taxTotal;

    if (isEditing && id) {
      updatePurchaseOrder(id, {
        vendor: vendor.name || 'Unknown',
        vendorId: vendor.id,
        date: formData.date,
        lineItems,
        subtotal,
        tax: taxTotal,
        total,
        status,
      });
      toast.success(`Purchase order ${status === 'confirmed' ? 'confirmed' : 'updated'}`);
    } else {
      const orderNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-3).padStart(3, '0')}`;
      addPurchaseOrder({
        orderNumber,
        vendor: vendor.name || 'Unknown',
        vendorId: vendor.id,
        date: formData.date,
        lineItems,
        subtotal,
        tax: taxTotal,
        total,
        status,
      });
      toast.success(`Purchase order ${status === 'confirmed' ? 'confirmed' : 'saved as draft'}`);
    }
    navigate('/admin/billing');
  };

  const handleCreateBill = () => {
    if (!existingOrder || existingOrder.status !== 'confirmed') {
      toast.error('Only confirmed orders can be billed');
      return;
    }

    const vendor = contacts.find(c => c.id === existingOrder.vendorId);
    if (!vendor) {
      toast.error('Vendor not found');
      return;
    }

    const billDate = new Date();
    const dueDate = new Date(billDate);
    dueDate.setDate(dueDate.getDate() + 30);

    addVendorBill({
      billNumber: `BILL-${Date.now()}`,
      vendor: existingOrder.vendor,
      vendorId: existingOrder.vendorId,
      purchaseOrderId: existingOrder.id,
      billDate: billDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      lineItems: existingOrder.lineItems,
      subtotal: existingOrder.subtotal,
      tax: existingOrder.tax,
      total: existingOrder.total,
      paid: 0,
      status: 'unpaid',
    });

    toast.success('Vendor bill created successfully');
    navigate('/admin/billing');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    if (!formData.vendor) {
      toast.error('Please select a vendor before sending');
      return;
    }
    const vendor = contacts.find(c => c.id === formData.vendor);
    toast.success(`Purchase order sent to ${vendor?.email || vendor?.name || 'vendor'}`);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>New Purchase Order | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                {isEditing ? 'Edit Purchase Order' : 'New Purchase Order'}
              </h1>
              <p className="text-muted-foreground">{existingOrder?.orderNumber || 'New Order'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleSend}>
              <Send className="h-4 w-4" />
              Send
            </Button>
            {isEditing && existingOrder?.status === 'confirmed' && (
              <Button variant="outline" onClick={handleCreateBill} className="gap-2">
                <FileText className="h-4 w-4" />
                Create Bill
              </Button>
            )}
            <Button variant="outline" onClick={() => handleSubmit('draft')}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit('confirmed')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </div>
        </div>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Vendor *</Label>
                <Select
                  value={formData.vendor}
                  onValueChange={(v) => setFormData({ ...formData, vendor: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {contacts.filter(c => c.type === 'vendor' || c.type === 'both').map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name || 'Anonymous'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Products</CardTitle>
            <Button onClick={addLineItem} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead className="w-[100px]">Qty</TableHead>
                  <TableHead className="w-[120px]">Unit Price</TableHead>
                  <TableHead className="w-[80px]">Tax %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products added. Click "Add Product" to begin.
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.productId}
                          onValueChange={(v) => updateLineItem(item.id, 'productId', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            {adminProducts.filter(p => p.status !== 'archived').map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} - ₹{p.purchasePrice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.tax}
                          onChange={(e) => updateLineItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                          className="w-24 h-12 text-base"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{item.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{taxTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PurchaseOrderForm;
