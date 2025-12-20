import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, API_URL } from '@/lib/api';
import { toast } from 'sonner';

// Types
export type ProductStatus = 'new' | 'confirmed' | 'archived';
export type OrderStatus = 'draft' | 'confirmed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'partial' | 'unpaid' | 'cancelled';
export type UserRole = 'internal' | 'portal';
export type ContactType = 'customer' | 'vendor' | 'both';

// FIXED: Strict types for AdminProduct to match ProductCard requirements
export interface AdminProduct {
  id: string;
  name: string;
  category: 'men' | 'women' | 'children';
  type: 'shirts' | 'pants' | 'kurtas' | 'dresses' | 'jackets';
  material: 'cotton' | 'silk' | 'linen' | 'wool' | 'polyester';
  colors: string[];
  stock: number;
  salesPrice: number;
  salesTax: number;
  purchasePrice: number;
  purchaseTax: number;
  published: boolean;
  status: ProductStatus;
  description?: string;
  images: string[];
  price: number; 
}

export interface LineItem { id: string; productId: string; productName: string; quantity: number; unitPrice: number; tax: number; total: number; }
export interface SalesOrder { id: string; orderNumber: string; customer: string; customerId: string; paymentTerm?: string; date: string; lineItems: LineItem[]; couponCode?: string; discount: number; subtotal: number; tax: number; total: number; status: OrderStatus; }
export interface Invoice { id: string; invoiceNumber: string; customer: string; customerId: string; salesOrderId?: string; paymentTerm?: string; invoiceDate: string; dueDate: string; lineItems: LineItem[]; subtotal: number; tax: number; total: number; paid: number; status: InvoiceStatus; paidDate?: string; }
export interface PurchaseOrder { id: string; orderNumber: string; vendor: string; vendorId: string; date: string; lineItems: LineItem[]; subtotal: number; tax: number; total: number; status: OrderStatus; }
export interface VendorBill { id: string; billNumber: string; vendor: string; vendorId: string; purchaseOrderId?: string; billDate: string; dueDate: string; lineItems: LineItem[]; subtotal: number; tax: number; total: number; paid: number; status: InvoiceStatus; }
export interface User { id: string; name: string; email: string; phone?: string; address?: string; role: UserRole; status: 'active' | 'archived'; confirmed: boolean; }
export interface Contact { id: string; name?: string; email?: string; phone?: string; address?: string; type: ContactType; status: 'active' | 'archived'; }
export interface PaymentTerm { id: string; name: string; earlyPaymentDiscount: boolean; discountPercentage?: number; discountDays?: number; discountComputation?: 'base' | 'total'; active: boolean; }
export interface Offer { id: string; name: string; discountPercentage: number; startDate: string; endDate: string; availableOn: 'sales' | 'website' | 'both'; targetType: ContactType; }
export interface Coupon { id: string; code: string; offerId: string; offerName: string; customerId?: string; customerName?: string; validUntil: string; used: boolean; usedDate?: string; }

// Backend Data Shape (for mapping)
interface BackendProduct {
  id: number;
  name: string;
  price: number;
  current_stock: number;
}

interface StockUpdateEvent {
  type: string;
  product_id: number;
  new_stock: number;
}

interface AdminDataContextType {
  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, 'id'>) => string;
  updateProduct: (id: string, product: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  
  salesOrders: SalesOrder[];
  addSalesOrder: (order: Omit<SalesOrder, 'id'>) => string;
  updateSalesOrder: (id: string, order: Partial<SalesOrder>) => void;
  
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => string;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => void;
  
  vendorBills: VendorBill[];
  addVendorBill: (bill: Omit<VendorBill, 'id'>) => string;
  updateVendorBill: (id: string, bill: Partial<VendorBill>) => void;
  
  users: User[];
  addUser: (user: Omit<User, 'id'>) => string;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => string;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  paymentTerms: PaymentTerm[];
  addPaymentTerm: (term: Omit<PaymentTerm, 'id'>) => string;
  updatePaymentTerm: (id: string, term: Partial<PaymentTerm>) => void;
  deletePaymentTerm: (id: string) => void;
  
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id'>) => string;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => string;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  
  autoInvoicing: boolean;
  setAutoInvoicing: (value: boolean) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Helper for temporary IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [products, setProducts] = useState<AdminProduct[]>([]);

  // --- MOCK STATE ---
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [autoInvoicing, setAutoInvoicing] = useState(true);

  // --- 1. INITIAL FETCH FROM BACKEND ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<BackendProduct[]>('/orders/products');
        
        const mappedProducts: AdminProduct[] = res.data.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          // FIXED: Strict types here too
          category: 'Men', 
          type: 'Shirts',
          material: 'Cotton',
          
          colors: ['Blue', 'White'],
          stock: p.current_stock,
          salesPrice: p.price,
          price: p.price,
          salesTax: 18,
          purchasePrice: p.price * 0.6,
          purchaseTax: 12,
          published: true,
          status: 'confirmed',
          description: `High quality ${p.name}`,
          images: [`https://placehold.co/600x800/e2e8f0/1e293b?text=${encodeURIComponent(p.name)}`],
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Failed to load products from API:", err);
      }
    };

    fetchProducts();
  }, []);

  // --- 2. WEBSOCKET REAL-TIME SYNC ---
  useEffect(() => {
    const wsUrl = API_URL.replace('http', 'ws') + '/ws/admin';
    let ws: WebSocket;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🟢 Admin WebSocket Connected');
      };

      ws.onmessage = (event) => {
        const data: StockUpdateEvent = JSON.parse(event.data);
        
        if (data.type === 'STOCK_UPDATE') {
          setProducts(prevProducts => 
            prevProducts.map(p => {
              if (p.id === data.product_id.toString()) {
                toast.info(`Stock Updated: ${p.name} is now ${data.new_stock}`);
                return { ...p, stock: data.new_stock };
              }
              return p;
            })
          );
        }
      };

      ws.onclose = () => {
        setTimeout(connectWs, 3000);
      };
    };

    connectWs();

    return () => {
      if (ws) ws.close();
    };
  }, []);


  // --- CRUD FUNCTIONS ---

  const addProduct = useCallback((product: Omit<AdminProduct, 'id'>) => {
    const id = generateId();
    setProducts(prev => [...prev, { ...product, id }]);
    return id;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<AdminProduct>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addSalesOrder = (o: Omit<SalesOrder, 'id'>) => { const id = generateId(); setSalesOrders(p => [...p, {...o, id}]); return id; };
  const updateSalesOrder = (id: string, o: Partial<SalesOrder>) => setSalesOrders(p => p.map(i => i.id === id ? {...i, ...o} : i));
  
  const addInvoice = (i: Omit<Invoice, 'id'>) => { const id = generateId(); setInvoices(p => [...p, {...i, id}]); return id; };
  const updateInvoice = (id: string, i: Partial<Invoice>) => setInvoices(p => p.map(x => x.id === id ? {...x, ...i} : x));
  
  const addPurchaseOrder = (o: Omit<PurchaseOrder, 'id'>) => { const id = generateId(); setPurchaseOrders(p => [...p, {...o, id}]); return id; };
  const updatePurchaseOrder = (id: string, o: Partial<PurchaseOrder>) => setPurchaseOrders(p => p.map(i => i.id === id ? {...i, ...o} : i));
  
  const addVendorBill = (b: Omit<VendorBill, 'id'>) => { const id = generateId(); setVendorBills(p => [...p, {...b, id}]); return id; };
  const updateVendorBill = (id: string, b: Partial<VendorBill>) => setVendorBills(p => p.map(i => i.id === id ? {...i, ...b} : i));
  
  const addUser = (u: Omit<User, 'id'>) => { const id = generateId(); setUsers(p => [...p, {...u, id}]); return id; };
  const updateUser = (id: string, u: Partial<User>) => setUsers(p => p.map(i => i.id === id ? {...i, ...u} : i));
  const deleteUser = (id: string) => setUsers(p => p.filter(i => i.id !== id));
  
  const addContact = (c: Omit<Contact, 'id'>) => { const id = generateId(); setContacts(p => [...p, {...c, id}]); return id; };
  const updateContact = (id: string, c: Partial<Contact>) => setContacts(p => p.map(i => i.id === id ? {...i, ...c} : i));
  const deleteContact = (id: string) => setContacts(p => p.filter(i => i.id !== id));
  
  const addPaymentTerm = (t: Omit<PaymentTerm, 'id'>) => { const id = generateId(); setPaymentTerms(p => [...p, {...t, id}]); return id; };
  const updatePaymentTerm = (id: string, t: Partial<PaymentTerm>) => setPaymentTerms(p => p.map(i => i.id === id ? {...i, ...t} : i));
  const deletePaymentTerm = (id: string) => setPaymentTerms(p => p.filter(i => i.id !== id));
  
  const addOffer = (o: Omit<Offer, 'id'>) => { const id = generateId(); setOffers(p => [...p, {...o, id}]); return id; };
  const updateOffer = (id: string, o: Partial<Offer>) => setOffers(p => p.map(i => i.id === id ? {...i, ...o} : i));
  const deleteOffer = (id: string) => setOffers(p => p.filter(i => i.id !== id));
  
  const addCoupon = (c: Omit<Coupon, 'id'>) => { const id = generateId(); setCoupons(p => [...p, {...c, id}]); return id; };
  const updateCoupon = (id: string, c: Partial<Coupon>) => setCoupons(p => p.map(i => i.id === id ? {...i, ...c} : i));

  return (
    <AdminDataContext.Provider
      value={{
        products, addProduct, updateProduct, deleteProduct,
        salesOrders, addSalesOrder, updateSalesOrder,
        invoices, addInvoice, updateInvoice,
        purchaseOrders, addPurchaseOrder, updatePurchaseOrder,
        vendorBills, addVendorBill, updateVendorBill,
        users, addUser, updateUser, deleteUser,
        contacts, addContact, updateContact, deleteContact,
        paymentTerms, addPaymentTerm, updatePaymentTerm, deletePaymentTerm,
        offers, addOffer, updateOffer, deleteOffer,
        coupons, addCoupon, updateCoupon,
        autoInvoicing, setAutoInvoicing,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
};