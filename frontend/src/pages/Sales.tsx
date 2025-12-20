import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, Package, DollarSign, Users, Calendar, Filter, Eye, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock sales data
const mockSalesData = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    date: '2024-01-15',
    status: 'Delivered',
    items: 2,
    total: 5998,
    paymentStatus: 'Paid',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    date: '2024-01-14',
    status: 'Processing',
    items: 1,
    total: 2499,
    paymentStatus: 'Paid',
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    email: 'mike@example.com',
    date: '2024-01-13',
    status: 'Shipped',
    items: 3,
    total: 8997,
    paymentStatus: 'Paid',
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Wilson',
    email: 'sarah@example.com',
    date: '2024-01-12',
    status: 'Delivered',
    items: 1,
    total: 4999,
    paymentStatus: 'Paid',
  },
  {
    id: 'ORD-005',
    customer: 'Tom Brown',
    email: 'tom@example.com',
    date: '2024-01-11',
    status: 'Processing',
    items: 2,
    total: 3499,
    paymentStatus: 'Pending',
  },
];

const Sales = () => {
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter sales data
  const filteredSales = mockSalesData.filter(sale => {
    const matchesSearch = 
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const totalSales = mockSalesData.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = mockSalesData.length;
  const totalItems = mockSalesData.reduce((sum, sale) => sum + sale.items, 0);
  const avgOrderValue = totalSales / totalOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'Paid' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-amber-100 text-amber-700';
  };

  return (
    <>
      <Helmet>
        <title>Sales Overview | ApparelDesk</title>
      </Helmet>
      <Layout>
        <div className="bg-muted/30 py-8 lg:py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                  Sales Overview
                </h1>
                <p className="text-muted-foreground mt-2">
                  Track and manage your sales performance
                </p>
              </div>
              <Link to="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(totalSales)}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                  <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-soft p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(avgOrderValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-lg shadow-soft p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by order ID, customer name, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-card rounded-lg shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Items</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Payment</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Total</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-medium text-foreground">{sale.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-foreground">{sale.customer}</p>
                          <p className="text-sm text-muted-foreground">{sale.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-center text-muted-foreground">
                        {sale.items}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(sale.paymentStatus)}`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-foreground">
                        {formatPrice(sale.total)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <Link to={`/order/${sale.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/invoice/${sale.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSales.length === 0 && (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sales found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Sales;
