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
import CustomerLogin from "./pages/CustomerLogin";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import OrderDetail from "./pages/OrderDetail";
import InvoiceView from "./pages/InvoiceView";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import ProductForm from "./pages/admin/ProductForm";
import BillingPayments from "./pages/admin/BillingPayments";
import SalesOrderForm from "./pages/admin/SalesOrderForm";
import PaymentTermsOffers from "./pages/admin/PaymentTermsOffers";
import UsersContacts from "./pages/admin/UsersContacts";
import ReportsAdmin from "./pages/admin/ReportsAdmin";
import AdminProfile from "./pages/admin/AdminProfile";

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
              <BrowserRouter>
              <Routes>
                {/* Customer Portal Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
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
                <Route path="/admin/offers" element={<ProtectedRoute requireAdmin><PaymentTermsOffers /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UsersContacts /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><ReportsAdmin /></ProtectedRoute>} />
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
