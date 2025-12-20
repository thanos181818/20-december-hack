import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Filter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Mock data
const salesByProduct = [
  { product: 'Premium Cotton Shirt', quantity: 156, untaxed: 234000, tax: 42120, total: 276120, paid: 250000 },
  { product: 'Linen Kurta Set', quantity: 89, untaxed: 178000, tax: 32040, total: 210040, paid: 210040 },
  { product: 'Formal Blazer', quantity: 45, untaxed: 225000, tax: 40500, total: 265500, paid: 200000 },
  { product: 'Cotton Pants', quantity: 234, untaxed: 280800, tax: 50544, total: 331344, paid: 331344 },
];

const salesByCustomer = [
  { customer: 'John Doe', orders: 12, untaxed: 45000, tax: 8100, total: 53100, paid: 53100 },
  { customer: 'Jane Smith', orders: 8, untaxed: 32000, tax: 5760, total: 37760, paid: 30000 },
  { customer: 'Mike Johnson', orders: 15, untaxed: 78000, tax: 14040, total: 92040, paid: 92040 },
  { customer: 'Sarah Williams', orders: 5, untaxed: 18500, tax: 3330, total: 21830, paid: 15000 },
];

const purchasesByVendor = [
  { vendor: 'ABC Textiles', orders: 8, untaxed: 180000, tax: 21600, total: 201600, paid: 201600 },
  { vendor: 'XYZ Fabrics', orders: 5, untaxed: 125000, tax: 15000, total: 140000, paid: 100000 },
  { vendor: 'Cotton Mills Ltd', orders: 3, untaxed: 95000, tax: 11400, total: 106400, paid: 106400 },
];

const purchasesByProduct = [
  { product: 'Cotton Fabric (meters)', quantity: 5000, untaxed: 250000, tax: 30000, total: 280000, paid: 280000 },
  { product: 'Linen Fabric (meters)', quantity: 2000, untaxed: 180000, tax: 21600, total: 201600, paid: 150000 },
  { product: 'Buttons (packs)', quantity: 500, untaxed: 25000, tax: 3000, total: 28000, paid: 28000 },
];

const ReportsAdmin = () => {
  const [reportType, setReportType] = useState('sales');
  const [groupBy, setGroupBy] = useState('product');
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState('2024-01-31');

  const getData = () => {
    if (reportType === 'sales') {
      return groupBy === 'product' ? salesByProduct : salesByCustomer;
    }
    return groupBy === 'product' ? purchasesByProduct : purchasesByVendor;
  };

  const data = getData();
  
  const totals = data.reduce((acc, row: any) => ({
    quantity: acc.quantity + (row.quantity || row.orders || 0),
    untaxed: acc.untaxed + row.untaxed,
    tax: acc.tax + row.tax,
    total: acc.total + row.total,
    paid: acc.paid + row.paid,
  }), { quantity: 0, untaxed: 0, tax: 0, total: 0, paid: 0 });

  const handlePrint = () => {
    toast.success('Preparing report for print...');
    window.print();
  };

  const handleReset = () => {
    setFromDate('2024-01-01');
    setToDate('2024-01-31');
    setGroupBy('product');
    toast.success('Filters reset');
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Reports | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Analyze your sales and purchase data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Download className="h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="contact">
                      {reportType === 'sales' ? 'Customer' : 'Vendor'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total {reportType === 'sales' ? 'Sales' : 'Purchases'}</p>
                  <p className="text-2xl font-bold">₹{totals.total.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{totals.paid.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unpaid Amount</p>
                  <p className="text-2xl font-bold text-red-600">₹{(totals.total - totals.paid).toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tax</p>
                  <p className="text-2xl font-bold">₹{totals.tax.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === 'sales' ? 'Sales' : 'Purchase'} Report by {groupBy === 'product' ? 'Product' : reportType === 'sales' ? 'Customer' : 'Vendor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{groupBy === 'product' ? 'Product' : reportType === 'sales' ? 'Customer' : 'Vendor'}</TableHead>
                  <TableHead className="text-right">{groupBy === 'product' ? 'Quantity' : 'Orders'}</TableHead>
                  <TableHead className="text-right">Untaxed Amount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Unpaid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {(row as any).product || (row as any).customer || (row as any).vendor}
                    </TableCell>
                    <TableCell className="text-right">
                      {(row as any).quantity || (row as any).orders}
                    </TableCell>
                    <TableCell className="text-right">₹{row.untaxed.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{row.tax.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">₹{row.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">₹{row.paid.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">
                      ₹{(row.total - row.paid).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totals.quantity}</TableCell>
                  <TableCell className="text-right">₹{totals.untaxed.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{totals.tax.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{totals.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">₹{totals.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-600">
                    ₹{(totals.total - totals.paid).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ReportsAdmin;
