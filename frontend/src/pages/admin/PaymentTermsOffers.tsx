import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Search,
  Clock,
  Percent,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Mock data
const mockPaymentTerms = [
  { id: '1', name: 'Immediate Payment', earlyDiscount: false, discountPercent: 0, discountDays: 0, active: true },
  { id: '2', name: 'Net 15', earlyDiscount: true, discountPercent: 2, discountDays: 7, active: true },
  { id: '3', name: 'Net 30', earlyDiscount: true, discountPercent: 3, discountDays: 10, active: true },
  { id: '4', name: 'Net 45', earlyDiscount: false, discountPercent: 0, discountDays: 0, active: false },
];

const mockOffers = [
  { id: '1', name: 'Summer Sale', discount: 20, startDate: '2024-06-01', endDate: '2024-08-31', availableOn: 'website', target: 'customer', status: 'active' },
  { id: '2', name: 'Bulk Discount', discount: 15, startDate: '2024-01-01', endDate: '2024-12-31', availableOn: 'sales', target: 'both', status: 'active' },
  { id: '3', name: 'New Year Special', discount: 25, startDate: '2024-12-25', endDate: '2025-01-05', availableOn: 'website', target: 'customer', status: 'upcoming' },
];

const mockCoupons = [
  { id: '1', code: 'SUMMER20', offerId: '1', offerName: 'Summer Sale', validUntil: '2024-08-31', status: 'unused', customer: null },
  { id: '2', code: 'BULK15A', offerId: '2', offerName: 'Bulk Discount', validUntil: '2024-12-31', status: 'used', customer: 'John Doe' },
  { id: '3', code: 'NEWYEAR25', offerId: '3', offerName: 'New Year Special', validUntil: '2025-01-05', status: 'unused', customer: 'Jane Smith' },
];

const PaymentTermsOffers = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentTermDialog, setShowPaymentTermDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);

  return (
    <AdminLayout>
      <Helmet>
        <title>Payment Terms & Offers | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Payment Terms & Offers</h1>
          <p className="text-muted-foreground">Manage payment terms, discounts, and coupon codes</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="terms">Payment Terms</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Payment Terms
                  </CardTitle>
                  <Button size="sm" onClick={() => setActiveTab('terms')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{mockPaymentTerms.filter(t => t.active).length}</p>
                  <p className="text-sm text-muted-foreground">Active payment terms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Active Offers
                  </CardTitle>
                  <Button size="sm" onClick={() => setActiveTab('offers')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{mockOffers.filter(o => o.status === 'active').length}</p>
                  <p className="text-sm text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Terms */}
          <TabsContent value="terms" className="space-y-6 mt-6">
            <div className="flex justify-end">
              <Dialog open={showPaymentTermDialog} onOpenChange={setShowPaymentTermDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Payment Term
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle>Add Payment Term</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Term Name</Label>
                      <Input placeholder="e.g., Net 30" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Early Payment Discount</Label>
                      <Switch />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Discount %</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label>Within Days</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Active</Label>
                      <Switch defaultChecked />
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Payment term created');
                      setShowPaymentTermDialog(false);
                    }}>
                      Create Term
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Early Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPaymentTerms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell className="font-medium">{term.name}</TableCell>
                      <TableCell>
                        {term.earlyDiscount ? (
                          <span className="text-sm">
                            {term.discountPercent}% if paid within {term.discountDays} days
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          term.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {term.active ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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

          {/* Offers */}
          <TabsContent value="offers" className="space-y-6 mt-6">
            <div className="flex justify-end">
              <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle>Create Offer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Offer Name</Label>
                      <Input placeholder="e.g., Summer Sale" />
                    </div>
                    <div>
                      <Label>Discount Percentage</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div>
                      <Label>Available On</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Target</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Offer created');
                      setShowOfferDialog(false);
                    }}>
                      Create Offer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Available On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.name}</TableCell>
                      <TableCell>{offer.discount}%</TableCell>
                      <TableCell className="text-sm">
                        {offer.startDate} to {offer.endDate}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          {offer.availableOn}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          offer.status === 'active' ? 'bg-green-100 text-green-700' :
                          offer.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {offer.status}
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
                              setActiveTab('coupons');
                              setShowCouponDialog(true);
                            }}>
                              <Tag className="h-4 w-4 mr-2" />
                              Generate Coupons
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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

          {/* Coupons */}
          <TabsContent value="coupons" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search coupons..." className="pl-10" />
              </div>
              <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Generate Coupons
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle>Generate Coupon Codes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Select Offer</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select offer" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {mockOffers.map(offer => (
                            <SelectItem key={offer.id} value={offer.id}>
                              {offer.name} ({offer.discount}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input type="number" placeholder="10" />
                    </div>
                    <div>
                      <Label>Valid Until</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Assign to Customer (Optional)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any customer" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="any">Any Customer</SelectItem>
                          <SelectItem value="john">John Doe</SelectItem>
                          <SelectItem value="jane">Jane Smith</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Coupons generated');
                      setShowCouponDialog(false);
                    }}>
                      Generate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>{coupon.offerName}</TableCell>
                      <TableCell>{coupon.validUntil}</TableCell>
                      <TableCell>
                        {coupon.customer || <span className="text-muted-foreground">Any</span>}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          coupon.status === 'unused' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {coupon.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            toast.success('Coupon code copied');
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default PaymentTermsOffers;
