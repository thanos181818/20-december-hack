import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Tag,
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
import { products } from '@/data/products';
import { toast } from 'sonner';

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount?: number;
  total: number;
}


const SalesOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { salesOrders, addSalesOrder, updateSalesOrder, contacts, paymentTerms, products: adminProducts, addInvoice } = useAdminData();
  const isEditing = !!id;
  const existingOrder = isEditing ? salesOrders.find(o => o.id === id) : null;

  const deriveDiscountPercent = (order: typeof existingOrder) => {
    if (!order || !order.lineItems.length) {
      return 0;
    }
    const grossSubtotal = order.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    if (grossSubtotal === 0) {
      return 0;
    }
    return Math.round(((order.discount || 0) / grossSubtotal) * 100);
  };
  
  const [formData, setFormData] = useState({
    customer: existingOrder?.customerId || '',
    paymentTerm: existingOrder?.paymentTerm || '',
    date: existingOrder?.date || new Date().toISOString().split('T')[0],
    couponCode: existingOrder?.couponCode || '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(existingOrder?.lineItems || []);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(deriveDiscountPercent(existingOrder));

  useEffect(() => {
    if (existingOrder) {
      setFormData({
        customer: existingOrder.customerId,
        paymentTerm: existingOrder.paymentTerm || '',
        date: existingOrder.date,
        couponCode: existingOrder.couponCode || '',
      });
      setLineItems(existingOrder.lineItems);
      setCouponDiscountPercent(deriveDiscountPercent(existingOrder));
    }
  }, [existingOrder]);

  const computeLineTotals = useCallback((item: LineItem, discountPercent: number) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineDiscount = lineSubtotal * (discountPercent / 100);
    const taxableBase = lineSubtotal - lineDiscount;
    const taxAmount = taxableBase * (item.tax / 100);
    return {
      lineDiscount,
      taxableBase,
      taxAmount,
      lineTotal: taxableBase + taxAmount,
    };
  }, []);

  useEffect(() => {
    setLineItems(items => items.map(item => {
      const { lineDiscount, lineTotal } = computeLineTotals(item, couponDiscountPercent);
      return { ...item, discount: lineDiscount, total: lineTotal };
    }));
  }, [couponDiscountPercent, computeLineTotals]);

  const addLineItem = () => {
    const item: LineItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      tax: 18,
      discount: 0,
      total: 0,
    };
    const { lineDiscount, lineTotal } = computeLineTotals(item, couponDiscountPercent);
    item.discount = lineDiscount;
    item.total = lineTotal;
    setLineItems([...lineItems, item]);
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
            updated.unitPrice = product.salesPrice;
            updated.tax = product.salesTax;
          }
        }
        
        const { lineDiscount, lineTotal } = computeLineTotals(updated, couponDiscountPercent);
        updated.discount = lineDiscount;
        updated.total = lineTotal;
        
        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const applyCoupon = () => {
    if (formData.couponCode.toUpperCase() === 'SAVE10') {
      setCouponDiscountPercent(10);
      toast.success('Coupon applied: 10% discount');
    } else if (formData.couponCode.toUpperCase() === 'SAVE20') {
      setCouponDiscountPercent(20);
      toast.success('Coupon applied: 20% discount');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const totals = lineItems.reduce((acc, item) => {
    const { lineDiscount, taxableBase, taxAmount, lineTotal } = computeLineTotals(item, couponDiscountPercent);
    acc.gross += item.quantity * item.unitPrice;
    acc.discount += lineDiscount;
    acc.subtotal += taxableBase;
    acc.tax += taxAmount;
    acc.total += lineTotal;
    return acc;
  }, { gross: 0, discount: 0, subtotal: 0, tax: 0, total: 0 });

  const discountAmount = totals.discount;
  const subtotal = totals.subtotal;
  const taxTotal = totals.tax;
  const grandTotal = totals.total;

  const handleSubmit = async (status: 'draft' | 'confirmed') => {
    if (!formData.customer) {
      toast.error('Please select a customer');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    const customer = contacts.find(c => c.id === formData.customer);
    if (!customer) {
      toast.error('Customer not found');
      return;
    }

    try {
      if (isEditing && id) {
        await updateSalesOrder(id, {
          customer: customer.name || 'Unknown',
          customerId: customer.id,
          paymentTerm: formData.paymentTerm,
          date: formData.date,
          lineItems,
          couponCode: formData.couponCode,
          discount: discountAmount,
          subtotal,
          tax: taxTotal,
          total: grandTotal,
          status,
        });
      } else {
        const orderNumber = `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-3).padStart(3, '0')}`;
        const newOrderId = await addSalesOrder({
          orderNumber,
          customer: customer.name || 'Unknown',
          customerId: customer.id,
          paymentTerm: formData.paymentTerm,
          date: formData.date,
          lineItems,
          couponCode: formData.couponCode,
          discount: discountAmount,
          subtotal,
          tax: taxTotal,
          total: grandTotal,
          status,
        });
        if (!newOrderId) {
          return;
        }
        if (status === 'confirmed') {
          await updateSalesOrder(newOrderId, { status: 'confirmed' });
        }
      }
      navigate('/admin/billing');
    } catch (error) {
      console.error('Error saving sales order:', error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!existingOrder || existingOrder.status !== 'confirmed') {
      toast.error('Only confirmed orders can be invoiced');
      return;
    }

    const customer = contacts.find(c => c.id === existingOrder.customerId);
    if (!customer) {
      toast.error('Customer not found');
      return;
    }

    const paymentTerm = paymentTerms.find(t => t.id === existingOrder.paymentTerm);
    const daysToAdd = paymentTerm ? (paymentTerm.discountDays || 30) : 30;
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + daysToAdd);

    try {
      await addInvoice({
        invoiceNumber: `INV-${Date.now()}`,
        customer: existingOrder.customer,
        customerId: existingOrder.customerId,
        salesOrderId: existingOrder.id,
        paymentTerm: existingOrder.paymentTerm,
        invoiceDate: invoiceDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        lineItems: existingOrder.lineItems,
        subtotal: existingOrder.subtotal,
        tax: existingOrder.tax,
        total: existingOrder.total,
        paid: 0,
        status: 'unpaid',
      });
      navigate('/admin/billing');
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    if (!formData.customer) {
      toast.error('Please select a customer before sending');
      return;
    }
    const customer = contacts.find(c => c.id === formData.customer);
    toast.success(`Sales order sent to ${customer?.email || customer?.name || 'customer'}`);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>New Sales Order | Admin | ApparelDesk</title>
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
                {isEditing ? 'Edit Sales Order' : 'New Sales Order'}
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
              <Button variant="outline" onClick={handleCreateInvoice} className="gap-2">
                <FileText className="h-4 w-4" />
                Create Invoice
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
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Customer *</Label>
                <Select
                  value={formData.customer}
                  onValueChange={(v) => setFormData({ ...formData, customer: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {contacts.filter(c => c.type === 'customer' || c.type === 'both').map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name || 'Anonymous'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Term</Label>
                <Select
                  value={formData.paymentTerm}
                  onValueChange={(v) => setFormData({ ...formData, paymentTerm: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {paymentTerms.filter(t => t.active).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
                                {p.name} - ₹{p.salesPrice}
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

        {/* Coupon & Totals */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Apply Coupon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                />
                <Button onClick={applyCoupon}>Apply</Button>
              </div>
              {couponDiscountPercent > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  {couponDiscountPercent}% discount applied
                </p>
              )}
            </CardContent>
          </Card>

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
              {couponDiscountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({couponDiscountPercent}%)</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesOrderForm;
