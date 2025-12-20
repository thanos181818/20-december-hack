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
import { useAdminData } from '@/contexts/AdminDataContext';

const PaymentTermsOffers = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    paymentTerms,
    addPaymentTerm,
    updatePaymentTerm,
    deletePaymentTerm,
    offers,
    addOffer,
    updateOffer,
    deleteOffer,
    coupons,
    addCoupon,
  } = useAdminData();
  
  // Dialog states
  const [showPaymentTermDialog, setShowPaymentTermDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  
  // Editing states
  const [editingPaymentTerm, setEditingPaymentTerm] = useState<any>(null);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  
  // Form states for payment terms
  const [paymentTermForm, setPaymentTermForm] = useState({
    name: '',
    earlyDiscount: false,
    discountPercent: 0,
    discountDays: 0,
    active: true
  });
  
  // Form states for offers
  const [offerForm, setOfferForm] = useState({
    name: '',
    discount: 0,
    startDate: '',
    endDate: '',
    availableOn: 'website'
  });
  const [couponForm, setCouponForm] = useState({
    offerId: '',
    quantity: 1,
    validUntil: '',
    customerName: '',
  });
  
  // Payment Term handlers
  const handleAddPaymentTerm = () => {
    setEditingPaymentTerm(null);
    setPaymentTermForm({
      name: '',
      earlyDiscount: false,
      discountPercent: 0,
      discountDays: 0,
      active: true
    });
    setShowPaymentTermDialog(true);
  };
  
  const handleEditPaymentTerm = (termId: string) => {
    const term = paymentTerms.find(t => t.id === termId);
    if (term) {
      setEditingPaymentTerm(term);
      setPaymentTermForm({
        name: term.name,
        earlyDiscount: term.earlyPaymentDiscount,
        discountPercent: term.discountPercentage || 0,
        discountDays: term.discountDays || 0,
        active: term.active,
      });
      setShowPaymentTermDialog(true);
    }
  };
  
  const handleDeletePaymentTerm = async (termId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment term?')) {
      return;
    }
    await deletePaymentTerm(termId);
  };
  
  const handleSavePaymentTerm = async () => {
    if (!paymentTermForm.name) {
      toast.error('Please enter a term name');
      return;
    }

    const payload = {
      name: paymentTermForm.name,
      earlyPaymentDiscount: paymentTermForm.earlyDiscount,
      discountPercentage: paymentTermForm.discountPercent,
      discountDays: paymentTermForm.discountDays,
      discountComputation: 'base' as const,
      active: paymentTermForm.active,
    };

    if (editingPaymentTerm) {
      await updatePaymentTerm(editingPaymentTerm.id, payload);
    } else {
      await addPaymentTerm(payload);
    }
    setShowPaymentTermDialog(false);
  };
  
  // Offer handlers
  const handleAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      name: '',
      discount: 0,
      startDate: '',
      endDate: '',
      availableOn: 'website'
    });
    setShowOfferDialog(true);
  };
  
  const handleEditOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        name: offer.name,
        discount: offer.discount,
        startDate: offer.startDate,
        endDate: offer.endDate,
        availableOn: offer.availableOn,
      });
      setShowOfferDialog(true);
    }
  };
  
  const handleDeleteOffer = (offerId: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }
    deleteOffer(offerId);
  };
  
  const handleSaveOffer = () => {
    if (!offerForm.name || !offerForm.discount || !offerForm.startDate || !offerForm.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const now = new Date();
    const start = new Date(offerForm.startDate);
    const end = new Date(offerForm.endDate);
    let status: 'active' | 'upcoming' | 'expired' = 'active';
    if (start > now) {
      status = 'upcoming';
    } else if (end < now) {
      status = 'expired';
    }

    if (editingOffer) {
      updateOffer(editingOffer.id, { ...offerForm, status });
    } else {
      addOffer({ ...offerForm, status });
    }
    setShowOfferDialog(false);
  };

  const handleGenerateCoupons = () => {
    if (!couponForm.offerId || !couponForm.validUntil) {
      toast.error('Select an offer and validity date');
      return;
    }
    const offer = offers.find(o => o.id === couponForm.offerId);
    if (!offer) {
      toast.error('Selected offer not found');
      return;
    }
    const quantity = Math.max(1, couponForm.quantity);
    for (let i = 0; i < quantity; i += 1) {
      const code = `${offer.name.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      addCoupon({
        code,
        offerId: offer.id,
        offerName: offer.name,
        validUntil: couponForm.validUntil,
        customerName: couponForm.customerName || undefined,
        status: 'unused',
      });
    }
    toast.success('Coupons generated');
    setShowCouponDialog(false);
    setCouponForm({ offerId: '', quantity: 1, validUntil: '', customerName: '' });
  };

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
                  <p className="text-3xl font-bold">{paymentTerms.filter(t => t.active).length}</p>
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
                  <p className="text-3xl font-bold">{offers.filter(o => o.status === 'active').length}</p>
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
                  <Button className="gap-2" onClick={handleAddPaymentTerm}>
                    <Plus className="h-4 w-4" />
                    Add Payment Term
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle>{editingPaymentTerm ? 'Edit Payment Term' : 'Add Payment Term'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Term Name</Label>
                      <Input 
                        placeholder="e.g., Net 30" 
                        value={paymentTermForm.name}
                        onChange={(e) => setPaymentTermForm({ ...paymentTermForm, name: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Early Payment Discount</Label>
                      <Switch 
                        checked={paymentTermForm.earlyDiscount}
                        onCheckedChange={(checked) => setPaymentTermForm({ ...paymentTermForm, earlyDiscount: checked })}
                      />
                    </div>
                    {paymentTermForm.earlyDiscount && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Discount %</Label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={paymentTermForm.discountPercent}
                          onChange={(e) => setPaymentTermForm({ ...paymentTermForm, discountPercent: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Within Days</Label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={paymentTermForm.discountDays}
                          onChange={(e) => setPaymentTermForm({ ...paymentTermForm, discountDays: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Label>Active</Label>
                      <Switch 
                        checked={paymentTermForm.active}
                        onCheckedChange={(checked) => setPaymentTermForm({ ...paymentTermForm, active: checked })}
                      />
                    </div>
                    <Button className="w-full" onClick={handleSavePaymentTerm}>
                      {editingPaymentTerm ? 'Update' : 'Create'} Term
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
                  {paymentTerms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell className="font-medium">{term.name}</TableCell>
                      <TableCell>
                        {term.earlyPaymentDiscount ? (
                          <span className="text-sm">
                            {term.discountPercentage || 0}% if paid within {term.discountDays || 0} days
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
                            <DropdownMenuItem onClick={() => handleEditPaymentTerm(term.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePaymentTerm(term.id)}>
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
                  <Button className="gap-2" onClick={handleAddOffer}>
                    <Plus className="h-4 w-4" />
                    Create Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create Offer'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Offer Name</Label>
                      <Input 
                        placeholder="e.g., Summer Sale" 
                        value={offerForm.name}
                        onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Discount Percentage</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={offerForm.discount}
                        onChange={(e) => setOfferForm({ ...offerForm, discount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input 
                          type="date" 
                          value={offerForm.startDate}
                          onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input 
                          type="date" 
                          value={offerForm.endDate}
                          onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Available On</Label>
                      <Select value={offerForm.availableOn} onValueChange={(v) => setOfferForm({ ...offerForm, availableOn: v })}>
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
                    <Button className="w-full" onClick={handleSaveOffer}>
                      {editingOffer ? 'Update' : 'Create'} Offer
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
                  {offers.map((offer) => (
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
                            <DropdownMenuItem onClick={() => handleEditOffer(offer.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteOffer(offer.id)}>
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
                      <Select value={couponForm.offerId} onValueChange={(value) => setCouponForm({ ...couponForm, offerId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select offer" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {offers.map(offer => (
                            <SelectItem key={offer.id} value={offer.id}>
                              {offer.name} ({offer.discount}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={couponForm.quantity}
                        onChange={(e) => setCouponForm({ ...couponForm, quantity: parseInt(e.target.value, 10) || 1 })}
                      />
                    </div>
                    <div>
                      <Label>Valid Until</Label>
                      <Input
                        type="date"
                        value={couponForm.validUntil}
                        onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Assign to Customer (Optional)</Label>
                      <Input
                        placeholder="Customer name"
                        value={couponForm.customerName}
                        onChange={(e) => setCouponForm({ ...couponForm, customerName: e.target.value })}
                      />
                    </div>
                    <Button className="w-full" onClick={handleGenerateCoupons}>
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
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No coupons yet
                      </TableCell>
                    </TableRow>
                  ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>{coupon.offerName}</TableCell>
                      <TableCell>{coupon.validUntil}</TableCell>
                      <TableCell>
                        {coupon.customerName || <span className="text-muted-foreground">Any</span>}
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
                  )))}
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
