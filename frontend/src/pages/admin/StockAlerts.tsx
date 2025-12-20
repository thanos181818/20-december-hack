import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Mail, 
  Send, 
  Package, 
  RefreshCw, 
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface LowStockProduct {
  id: number;
  name: string;
  current_stock: number;
  threshold: number;
  category: string | null;
}

interface LowStockReport {
  products: LowStockProduct[];
  total_count: number;
  report_date: string;
  email_sent: boolean;
}

interface EmailConfig {
  smtp_server: string;
  smtp_port: number;
  sender_configured: boolean;
  receiver_configured: boolean;
  default_threshold: number;
}

const StockAlerts = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<LowStockReport | null>(null);
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/stock-alerts/config');
      setConfig(res.data);
      setThreshold(res.data.default_threshold);
    } catch (error) {
      console.error('Failed to fetch email config:', error);
    }
  };

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/stock-alerts/check?threshold=${threshold}`);
      setReport(res.data);
    } catch (error) {
      console.error('Failed to check low stock:', error);
      toast.error('Failed to check stock levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchLowStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThresholdChange = (value: number[]) => {
    setThreshold(value[0]);
  };

  const handleCheckStock = () => {
    fetchLowStock();
  };

  const handleSendEmail = async () => {
    if (!config?.sender_configured) {
      toast.error('Email sender not configured. Please set SENDER_EMAIL and SENDER_PASSWORD in backend .env file.');
      return;
    }

    if (!receiverEmail && !config?.receiver_configured) {
      toast.error('Please enter a receiver email address');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/admin/stock-alerts/send-notification', {
        receiver_email: receiverEmail || undefined,
        threshold: threshold
      });

      if (res.data.email_sent) {
        toast.success('Low stock notification email sent successfully!');
        setSendDialogOpen(false);
        setReport(res.data);
      } else {
        toast.error('Failed to send email. Check server logs for details.');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to send email notification');
    } finally {
      setSending(false);
    }
  };

  const getStockBadge = (stock: number, threshold: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock <= threshold / 2) {
      return <Badge className="bg-orange-500">Critical</Badge>;
    }
    return <Badge className="bg-yellow-500">Low Stock</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Stock Alerts
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor low stock levels and send email notifications
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCheckStock} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!report?.products.length}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Alert Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Low Stock Alert</DialogTitle>
                  <DialogDescription>
                    Send an email notification with the current low stock report.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Receiver Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={config?.receiver_configured ? "Using default from config" : "Enter email address"}
                      value={receiverEmail}
                      onChange={(e) => setReceiverEmail(e.target.value)}
                    />
                    {config?.receiver_configured && (
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use default receiver from configuration
                      </p>
                    )}
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>{report?.total_count || 0}</strong> products will be included in this alert.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail} disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{report?.total_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">
                    {report?.products.filter(p => p.current_stock === 0).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Threshold</p>
                  <p className="text-2xl font-bold">{threshold} units</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${config?.sender_configured ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {config?.sender_configured ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Status</p>
                  <p className="text-lg font-medium">
                    {config?.sender_configured ? 'Configured' : 'Not Set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Threshold Slider */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Threshold</CardTitle>
            <CardDescription>
              Set the minimum stock level. Products below this will appear in the alert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-8">0</span>
                <Slider
                  value={[threshold]}
                  onValueChange={handleThresholdChange}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Current threshold: <strong>{threshold} units</strong>
                </span>
                <Button variant="outline" size="sm" onClick={handleCheckStock}>
                  Apply & Check
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Products</CardTitle>
            <CardDescription>
              {report?.report_date && (
                <>Last checked: {new Date(report.report_date).toLocaleString()}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : report?.products.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All Stock Levels OK!</h3>
                <p className="text-muted-foreground mt-1">
                  No products are below the threshold of {threshold} units.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Threshold</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report?.products.map((product) => (
                    <TableRow 
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                    >
                      <TableCell className="font-mono">#{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${product.current_stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.current_stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{product.threshold}</TableCell>
                      <TableCell>{getStockBadge(product.current_stock, product.threshold)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Email Configuration Info */}
        {!config?.sender_configured && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Email Not Configured</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    To enable email notifications, add the following environment variables to your backend:
                  </p>
                  <pre className="mt-3 p-3 bg-yellow-100 rounded text-xs font-mono text-yellow-800">
{`SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
RECEIVER_EMAIL=admin@company.com`}
                  </pre>
                  <p className="text-xs text-yellow-600 mt-2">
                    For Gmail, use an App Password instead of your regular password.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default StockAlerts;
