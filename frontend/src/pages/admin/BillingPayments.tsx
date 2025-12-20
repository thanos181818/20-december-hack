import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ShoppingCart,
  FileText,
  CreditCard,
  Package,
  Receipt,
  Wallet,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  Send,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminData } from '@/contexts/AdminDataContext';
import { toast } from 'sonner';

const BillingPayments = () => {
  const navigate = useNavigate();
  const { 
    salesOrders, 
    invoices, 
    purchaseOrders, 
    vendorBills,
    contacts,
    updateSalesOrder,
    updateInvoice,
    deleteInvoice,
    updateVendorBill,
    updatePurchaseOrder,
    addInvoice,
    addVendorBill,
    autoInvoicing,
    setAutoInvoicing,
  } = useAdminData();
  const [activeTab, setActiveTab] = useState('overview');
  const [salesOrderSearch, setSalesOrderSearch] = useState('');
  const [purchaseOrderSearch, setPurchaseOrderSearch] = useState('');

  // Calculate current month dates
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Calculate overview metrics
  const currentMonthOrders = salesOrders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
  }).length;

  const pendingOrders = salesOrders.filter(order => 
    order.status === 'confirmed' && !invoices.some(inv => inv.salesOrderId === order.id)
  ).length;

  const unpaidInvoices = invoices.filter(inv => 
    inv.status === 'unpaid' || inv.status === 'partial'
  ).length;

  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    const dueDate = new Date(inv.dueDate);
    return dueDate < now;
  }).length;

  const currentMonthPOs = purchaseOrders.filter(po => {
    const poDate = new Date(po.date);
    return poDate >= currentMonthStart && poDate <= currentMonthEnd;
  }).length;

  const pendingPOs = purchaseOrders.filter(po => 
    po.status === 'confirmed' && !vendorBills.some(bill => bill.purchaseOrderId === po.id)
  ).length;

  const unpaidBills = vendorBills.filter(bill => 
    bill.status === 'unpaid' || bill.status === 'partial'
  ).length;

  const overdueBills = vendorBills.filter(bill => {
    if (bill.status === 'paid' || bill.status === 'cancelled') return false;
    const dueDate = new Date(bill.dueDate);
    return dueDate < now;
  }).length;

  // Filter sales orders by search
  const filteredSalesOrders = salesOrders.filter(order => 
    order.orderNumber.toLowerCase().includes(salesOrderSearch.toLowerCase()) ||
    order.customer.toLowerCase().includes(salesOrderSearch.toLowerCase())
  );

  // Filter purchase orders by search
  const filteredPurchaseOrders = purchaseOrders.filter(po => 
    po.orderNumber.toLowerCase().includes(purchaseOrderSearch.toLowerCase()) ||
    po.vendor.toLowerCase().includes(purchaseOrderSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <Helmet>
        <title>Billing & Payments | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Billing & Payments</h1>
            <p className="text-muted-foreground">Manage sales, purchases, and payments</p>
          </div>
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="auto-invoice" className="text-sm">Automatic Invoicing</Label>
            <Switch
              id="auto-invoice"
              checked={autoInvoicing}
              onCheckedChange={(checked) => {
                setAutoInvoicing(checked);
                toast.success(checked ? 'Auto invoicing enabled' : 'Auto invoicing disabled');
              }}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales-orders">Sales Orders</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="bills">Vendor Bills</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sales Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setActiveTab('sales-orders')}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Sales Orders</div>
                        <div className="text-xs text-muted-foreground">
                          {currentMonthOrders} this month • {pendingOrders} pending
                        </div>
                      </div>
                    </div>
                    <span className="font-bold">{salesOrders.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Customer Invoices</div>
                        <div className="text-xs text-muted-foreground">
                          {unpaidInvoices} unpaid • {overdueInvoices} overdue
                        </div>
                      </div>
                    </div>
                    <span className="font-bold">{invoices.length}</span>
                  </button>
                  <div className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span>Customer Payments</span>
                    </div>
                    <span className="font-bold">12</span>
                  </div>
                </CardContent>
              </Card>

              {/* Purchases Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Purchases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setActiveTab('purchase-orders')}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Purchase Orders</div>
                        <div className="text-xs text-muted-foreground">
                          {currentMonthPOs} this month • {pendingPOs} pending
                        </div>
                      </div>
                    </div>
                    <span className="font-bold">{purchaseOrders.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('bills')}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Vendor Bills</div>
                        <div className="text-xs text-muted-foreground">
                          {unpaidBills} unpaid • {overdueBills} overdue
                        </div>
                      </div>
                    </div>
                    <span className="font-bold">{vendorBills.length}</span>
                  </button>
                  <div className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span>Vendor Payments</span>
                    </div>
                    <span className="font-bold">8</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Orders */}
          <TabsContent value="sales-orders" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-10" 
                  value={salesOrderSearch}
                  onChange={(e) => setSalesOrderSearch(e.target.value)}
                />
              </div>
              <Link to="/admin/billing/sales/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Sale Order
                </Button>
              </Link>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right">₹{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          order.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => navigate(`/admin/billing/sales/${order.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {order.status === 'confirmed' && (
                              <DropdownMenuItem onClick={async () => {
                                // Create invoice from sales order
                                console.log('Creating invoice from order:', order);
                                console.log('Order lineItems:', order.lineItems);
                                try {
                                  await addInvoice({
                                    customer: order.customer,
                                    customerId: order.customerId,
                                    salesOrderId: order.id,
                                    paymentTerm: order.paymentTerm,
                                    invoiceDate: new Date().toISOString().split('T')[0],
                                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    lineItems: order.lineItems,
                                    subtotal: order.subtotal,
                                    tax: order.tax,
                                    total: order.total,
                                    paid: 0,
                                    status: 'unpaid',
                                  });
                                  navigate(`/admin/billing`);
                                } catch (error) {
                                  console.error('Error creating invoice:', error);
                                }
                              }}>
                                <FileText className="h-4 w-4 mr-2" />
                                Create Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const customer = contacts.find(c => c.id === order.customerId);
                              toast.success(`Sales order sent to ${customer?.email || customer?.name || 'customer'}`);
                            }}>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === 'draft' && (
                              <DropdownMenuItem onClick={async () => {
                                try {
                                  await updateSalesOrder(order.id, { status: 'confirmed' });
                                } catch (error) {
                                  console.error('Error confirming order:', error);
                                }
                              }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={async () => {
                                  try {
                                    await updateSalesOrder(order.id, { status: 'cancelled' });
                                  } catch (error) {
                                    console.error('Error cancelling order:', error);
                                  }
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-10" />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{invoice.invoiceDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right">₹{invoice.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{invoice.paid.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => {
                              navigate(`/admin/billing/invoice/${invoice.id}`);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            {invoice.status !== 'paid' && (
                              <DropdownMenuItem onClick={() => {
                                navigate(`/admin/billing/invoice-payment/${invoice.id}`);
                              }}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const customer = contacts.find(c => c.id === invoice.customerId);
                              toast.success(`Invoice sent to ${customer?.email || customer?.name || 'customer'}`);
                            }}>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to delete this invoice?')) return;
                                await deleteInvoice(invoice.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Purchase Orders */}
          <TabsContent value="purchase-orders" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-10" 
                  value={purchaseOrderSearch}
                  onChange={(e) => setPurchaseOrderSearch(e.target.value)}
                />
              </div>
              <Link to="/admin/billing/purchase/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Purchase Order
                </Button>
              </Link>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No purchase orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.vendor}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right">₹{order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => navigate(`/admin/billing/purchase/${order.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {order.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => {
                                // Create vendor bill from purchase order
                                const billDate = new Date();
                                const dueDate = new Date(billDate);
                                dueDate.setDate(dueDate.getDate() + 30);

                                addVendorBill({
                                  billNumber: `BILL-${Date.now()}`,
                                  vendor: order.vendor,
                                  vendorId: order.vendorId,
                                  purchaseOrderId: order.id,
                                  billDate: billDate.toISOString().split('T')[0],
                                  dueDate: dueDate.toISOString().split('T')[0],
                                  lineItems: order.lineItems,
                                  subtotal: order.subtotal,
                                  tax: order.tax,
                                  total: order.total,
                                  paid: 0,
                                  status: 'unpaid',
                                });
                                toast.success('Vendor bill created successfully');
                              }}>
                                <Receipt className="h-4 w-4 mr-2" />
                                Create Bill
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const vendor = contacts.find(c => c.id === order.vendorId);
                              toast.success(`Purchase order sent to ${vendor?.email || vendor?.name || 'vendor'}`);
                            }}>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === 'draft' && (
                              <DropdownMenuItem onClick={() => {
                                updatePurchaseOrder(order.id, { status: 'confirmed' });
                                toast.success('Purchase order confirmed');
                              }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  updatePurchaseOrder(order.id, { status: 'cancelled' });
                                  toast.success('Purchase order cancelled');
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Vendor Bills */}
          <TabsContent value="bills" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search bills..." className="pl-10" />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No vendor bills found
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendorBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.billNumber}</TableCell>
                        <TableCell>{bill.vendor}</TableCell>
                        <TableCell>{bill.billDate}</TableCell>
                        <TableCell>{bill.dueDate}</TableCell>
                        <TableCell className="text-right">₹{bill.total.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{bill.paid.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {bill.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background">
                              <DropdownMenuItem onClick={() => {
                                navigate(`/admin/billing/bill/${bill.id}`);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {bill.status !== 'paid' && (
                                <DropdownMenuItem onClick={() => {
                                  navigate(`/admin/billing/bill-payment/${bill.id}`);
                                }}>
                                  <Wallet className="h-4 w-4 mr-2" />
                                  Pay
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => window.print()}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const vendor = contacts.find(c => c.id === bill.vendorId);
                                toast.success(`Bill sent to ${vendor?.email || vendor?.name || 'vendor'}`);
                              }}>
                                <Send className="h-4 w-4 mr-2" />
                                Send
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default BillingPayments;
