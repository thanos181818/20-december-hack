import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import CustomerLogin from "./pages/CustomerLogin";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import OrderDetail from "./pages/OrderDetail";
import InvoiceView from "./pages/InvoiceView";
import Sales from "./pages/Sales";
import VirtualTryOn from "./pages/VirtualTryOn";
import VisualSearch from "./pages/VisualSearch";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import ProductForm from "./pages/admin/ProductForm";
import BillingPayments from "./pages/admin/BillingPayments";
import SalesOrderForm from "./pages/admin/SalesOrderForm";
import PurchaseOrderForm from "./pages/admin/PurchaseOrderForm";
import InvoicePayment from "./pages/admin/InvoicePayment";
import BillPayment from "./pages/admin/BillPayment";
import AdminInvoiceView from "./pages/admin/InvoiceView";
import VendorBillView from "./pages/admin/VendorBillView";
import PaymentTermsOffers from "./pages/admin/PaymentTermsOffers";
import UsersContacts from "./pages/admin/UsersContacts";
import ReportsAdmin from "./pages/admin/ReportsAdmin";
import AdminProfile from "./pages/admin/AdminProfile";
import StockAlerts from "./pages/admin/StockAlerts";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminDataProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Customer Portal Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/virtual-try-on" element={<VirtualTryOn />} />
                <Route path="/visual-search" element={<VisualSearch />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<ProtectedRoute allowAll><OrderConfirmation /></ProtectedRoute>} />
                <Route path="/login" element={<CustomerLogin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
                <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute requireAdmin><ProductsAdmin /></ProtectedRoute>} />
                <Route path="/admin/products/new" element={<ProtectedRoute requireAdmin><ProductForm /></ProtectedRoute>} />
                <Route path="/admin/products/:id" element={<ProtectedRoute requireAdmin><ProductForm /></ProtectedRoute>} />
                <Route path="/admin/billing" element={<ProtectedRoute requireAdmin><BillingPayments /></ProtectedRoute>} />
                <Route path="/admin/billing/sales" element={<ProtectedRoute requireAdmin><BillingPayments /></ProtectedRoute>} />
                <Route path="/admin/billing/sales/new" element={<ProtectedRoute requireAdmin><SalesOrderForm /></ProtectedRoute>} />
                <Route path="/admin/billing/sales/:id" element={<ProtectedRoute requireAdmin><SalesOrderForm /></ProtectedRoute>} />
                <Route path="/admin/billing/purchase/new" element={<ProtectedRoute requireAdmin><PurchaseOrderForm /></ProtectedRoute>} />
                <Route path="/admin/billing/purchase/:id" element={<ProtectedRoute requireAdmin><PurchaseOrderForm /></ProtectedRoute>} />
                <Route path="/admin/billing/invoice/:id" element={<ProtectedRoute requireAdmin><AdminInvoiceView /></ProtectedRoute>} />
                <Route path="/admin/billing/bill/:id" element={<ProtectedRoute requireAdmin><VendorBillView /></ProtectedRoute>} />
                <Route path="/admin/billing/invoice-payment/:id" element={<ProtectedRoute requireAdmin><InvoicePayment /></ProtectedRoute>} />
                <Route path="/admin/billing/bill-payment/:id" element={<ProtectedRoute requireAdmin><BillPayment /></ProtectedRoute>} />
                <Route path="/admin/offers" element={<ProtectedRoute requireAdmin><PaymentTermsOffers /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UsersContacts /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><ReportsAdmin /></ProtectedRoute>} />
                <Route path="/admin/stock-alerts" element={<ProtectedRoute requireAdmin><StockAlerts /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute requireAdmin><AdminProfile /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
        </AdminDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
