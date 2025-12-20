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

  // --- INITIALIZE DUMMY DATA ---
  useEffect(() => {
    // Initialize Admin Products (if empty after API fetch)
    if (products.length === 0) {
      const initialProducts: AdminProduct[] = [
        {
          id: '1',
          name: 'Cotton Shirt',
          category: 'men',
          type: 'shirts',
          material: 'cotton',
          colors: ['Blue', 'White', 'Black'],
          stock: 50,
          salesPrice: 1200,
          salesTax: 18,
          purchasePrice: 720,
          purchaseTax: 12,
          published: true,
          status: 'confirmed',
          description: 'Premium cotton shirt for formal wear',
          images: ['https://placehold.co/600x800/e2e8f0/1e293b?text=Cotton+Shirt'],
          price: 1200,
        },
        {
          id: '2',
          name: 'Formal Pants',
          category: 'men',
          type: 'pants',
          material: 'polyester',
          colors: ['Black', 'Grey', 'Navy'],
          stock: 35,
          salesPrice: 1800,
          salesTax: 18,
          purchasePrice: 1080,
          purchaseTax: 12,
          published: true,
          status: 'confirmed',
          description: 'Classic formal pants for business attire',
          images: ['https://placehold.co/600x800/e2e8f0/1e293b?text=Formal+Pants'],
          price: 1800,
        },
        {
          id: '3',
          name: 'Silk Kurta',
          category: 'women',
          type: 'kurtas',
          material: 'silk',
          colors: ['Red', 'Green', 'Gold'],
          stock: 25,
          salesPrice: 2500,
          salesTax: 18,
          purchasePrice: 1500,
          purchaseTax: 12,
          published: true,
          status: 'confirmed',
          description: 'Elegant silk kurta for special occasions',
          images: ['https://placehold.co/600x800/e2e8f0/1e293b?text=Silk+Kurta'],
          price: 2500,
        },
        {
          id: '4',
          name: 'Designer Dress',
          category: 'women',
          type: 'dresses',
          material: 'silk',
          colors: ['Pink', 'Purple', 'Blue'],
          stock: 20,
          salesPrice: 3500,
          salesTax: 18,
          purchasePrice: 2100,
          purchaseTax: 12,
          published: true,
          status: 'confirmed',
          description: 'Stylish designer dress for parties',
          images: ['https://placehold.co/600x800/e2e8f0/1e293b?text=Designer+Dress'],
          price: 3500,
        },
        {
          id: '5',
          name: 'Wool Jacket',
          category: 'men',
          type: 'jackets',
          material: 'wool',
          colors: ['Brown', 'Black', 'Grey'],
          stock: 15,
          salesPrice: 4500,
          salesTax: 18,
          purchasePrice: 2700,
          purchaseTax: 12,
          published: true,
          status: 'confirmed',
          description: 'Warm wool jacket for winter',
          images: ['https://placehold.co/600x800/e2e8f0/1e293b?text=Wool+Jacket'],
          price: 4500,
        },
        {
          id: '6',
          name: 'Linen Shirt',
          category: 'men',
          type: 'shirts',
          material: 'linen',
          colors: ['White', 'Beige', 'Light Blue'],
          stock: 40,
          salesPrice: 1500,
          salesTax: 18,
          purchasePrice: 900,
          purchaseTax: 12,
          published: true,
          status: 'confirmed',
          description: 'Comfortable linen shirt for summer',
          images: ['https://placehold.co/600x800/e2e8f0/1e293b?text=Linen+Shirt'],
          price: 1500,
        },
      ];
      setProducts(initialProducts);
    }

    // Initialize Contacts
    if (contacts.length === 0) {
      const initialContacts: Contact[] = [
        { id: 'c1', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98765 43210', address: '123 MG Road, Bangalore, Karnataka 560001', type: 'customer', status: 'active' },
        { id: 'c2', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43211', address: '456 Park Street, Kolkata, West Bengal 700016', type: 'customer', status: 'active' },
        { id: 'c3', name: 'Amit Patel', email: 'amit@example.com', phone: '+91 98765 43212', address: '789 Connaught Place, New Delhi 110001', type: 'customer', status: 'active' },
        { id: 'c4', name: 'Global Textiles Pvt Ltd', email: 'sales@globaltextiles.com', phone: '+91 22 2345 6789', address: '15 Industrial Area, Surat, Gujarat 395006', type: 'vendor', status: 'active' },
        { id: 'c5', name: 'Fashion Fabrics Inc', email: 'orders@fashionfabrics.com', phone: '+91 44 3456 7890', address: '88 Textile Hub, Chennai, Tamil Nadu 600002', type: 'vendor', status: 'active' },
        { id: 'c6', name: 'Premium Suppliers', email: 'info@premiumsuppliers.com', phone: '+91 80 4567 8901', address: '22 Supply Chain Road, Mumbai, Maharashtra 400001', type: 'vendor', status: 'active' },
      ];
      setContacts(initialContacts);
    }

    // Initialize Payment Terms
    if (paymentTerms.length === 0) {
      const initialTerms: PaymentTerm[] = [
        { id: 'pt1', name: 'Net 30', earlyPaymentDiscount: false, active: true },
        { id: 'pt2', name: 'Net 15', earlyPaymentDiscount: false, active: true },
        { id: 'pt3', name: '2/10 Net 30', earlyPaymentDiscount: true, discountPercentage: 2, discountDays: 10, discountComputation: 'base', active: true },
        { id: 'pt4', name: 'Due on Receipt', earlyPaymentDiscount: false, active: true },
      ];
      setPaymentTerms(initialTerms);
    }

    // Initialize Sales Orders
    if (salesOrders.length === 0) {
      const initialSalesOrders: SalesOrder[] = [
        {
          id: 'so1',
          orderNumber: 'SO-2025-001',
          customer: 'Rajesh Kumar',
          customerId: 'c1',
          paymentTerm: 'pt1',
          date: '2025-12-15',
          lineItems: [
            { id: 'li1', productId: '1', productName: 'Cotton Shirt', quantity: 5, unitPrice: 1200, tax: 18, total: 7080 },
            { id: 'li2', productId: '2', productName: 'Formal Pants', quantity: 3, unitPrice: 1800, tax: 18, total: 6372 },
          ],
          discount: 0,
          subtotal: 12000,
          tax: 2160,
          total: 14160,
          status: 'confirmed',
        },
        {
          id: 'so2',
          orderNumber: 'SO-2025-002',
          customer: 'Priya Sharma',
          customerId: 'c2',
          paymentTerm: 'pt3',
          date: '2025-12-18',
          lineItems: [
            { id: 'li3', productId: '3', productName: 'Silk Kurta', quantity: 2, unitPrice: 2500, tax: 18, total: 5900 },
            { id: 'li4', productId: '4', productName: 'Designer Dress', quantity: 1, unitPrice: 3500, tax: 18, total: 4130 },
          ],
          couponCode: 'SAVE10',
          discount: 10,
          subtotal: 6000,
          tax: 1080,
          total: 6372,
          status: 'confirmed',
        },
        {
          id: 'so3',
          orderNumber: 'SO-2025-003',
          customer: 'Amit Patel',
          customerId: 'c3',
          paymentTerm: 'pt2',
          date: '2025-12-20',
          lineItems: [
            { id: 'li5', productId: '5', productName: 'Wool Jacket', quantity: 2, unitPrice: 4500, tax: 18, total: 10620 },
          ],
          discount: 0,
          subtotal: 9000,
          tax: 1620,
          total: 10620,
          status: 'draft',
        },
      ];
      setSalesOrders(initialSalesOrders);
    }

    // Initialize Invoices
    if (invoices.length === 0) {
      const initialInvoices: Invoice[] = [
        {
          id: 'inv1',
          invoiceNumber: 'INV-2025-001',
          customer: 'Rajesh Kumar',
          customerId: 'c1',
          salesOrderId: 'so1',
          paymentTerm: 'pt1',
          invoiceDate: '2025-12-15',
          dueDate: '2026-01-14',
          lineItems: [
            { id: 'li1', productId: '1', productName: 'Cotton Shirt', quantity: 5, unitPrice: 1200, tax: 18, total: 7080 },
            { id: 'li2', productId: '2', productName: 'Formal Pants', quantity: 3, unitPrice: 1800, tax: 18, total: 6372 },
          ],
          subtotal: 12000,
          tax: 2160,
          total: 14160,
          paid: 0,
          status: 'unpaid',
        },
        {
          id: 'inv2',
          invoiceNumber: 'INV-2025-002',
          customer: 'Priya Sharma',
          customerId: 'c2',
          salesOrderId: 'so2',
          paymentTerm: 'pt3',
          invoiceDate: '2025-12-18',
          dueDate: '2026-01-17',
          lineItems: [
            { id: 'li3', productId: '3', productName: 'Silk Kurta', quantity: 2, unitPrice: 2500, tax: 18, total: 5900 },
            { id: 'li4', productId: '4', productName: 'Designer Dress', quantity: 1, unitPrice: 3500, tax: 18, total: 4130 },
          ],
          subtotal: 6000,
          tax: 1080,
          total: 6372,
          paid: 3000,
          status: 'partial',
        },
        {
          id: 'inv3',
          invoiceNumber: 'INV-2025-003',
          customer: 'Amit Patel',
          customerId: 'c3',
          invoiceDate: '2025-11-20',
          dueDate: '2025-12-05',
          lineItems: [
            { id: 'li6', productId: '6', productName: 'Linen Shirt', quantity: 4, unitPrice: 1500, tax: 18, total: 7080 },
          ],
          subtotal: 6000,
          tax: 1080,
          total: 7080,
          paid: 0,
          status: 'unpaid',
        },
      ];
      setInvoices(initialInvoices);
    }

    // Initialize Purchase Orders
    if (purchaseOrders.length === 0) {
      const initialPurchaseOrders: PurchaseOrder[] = [
        {
          id: 'po1',
          orderNumber: 'PO-2025-001',
          vendor: 'Global Textiles Pvt Ltd',
          vendorId: 'c4',
          date: '2025-12-10',
          lineItems: [
            { id: 'li7', productId: '1', productName: 'Cotton Fabric', quantity: 100, unitPrice: 500, tax: 12, total: 56000 },
            { id: 'li8', productId: '2', productName: 'Polyester Thread', quantity: 50, unitPrice: 200, tax: 12, total: 11200 },
          ],
          subtotal: 60000,
          tax: 7200,
          total: 67200,
          status: 'confirmed',
        },
        {
          id: 'po2',
          orderNumber: 'PO-2025-002',
          vendor: 'Fashion Fabrics Inc',
          vendorId: 'c5',
          date: '2025-12-16',
          lineItems: [
            { id: 'li9', productId: '3', productName: 'Silk Material', quantity: 25, unitPrice: 1200, tax: 12, total: 33600 },
          ],
          subtotal: 30000,
          tax: 3600,
          total: 33600,
          status: 'confirmed',
        },
        {
          id: 'po3',
          orderNumber: 'PO-2025-003',
          vendor: 'Premium Suppliers',
          vendorId: 'c6',
          date: '2025-12-19',
          lineItems: [
            { id: 'li10', productId: '4', productName: 'Wool Material', quantity: 40, unitPrice: 1500, tax: 12, total: 67200 },
            { id: 'li11', productId: '5', productName: 'Buttons Pack', quantity: 200, unitPrice: 50, tax: 12, total: 11200 },
          ],
          subtotal: 70000,
          tax: 8400,
          total: 78400,
          status: 'draft',
        },
      ];
      setPurchaseOrders(initialPurchaseOrders);
    }

    // Initialize Vendor Bills
    if (vendorBills.length === 0) {
      const initialVendorBills: VendorBill[] = [
        {
          id: 'vb1',
          billNumber: 'BILL-2025-001',
          vendor: 'Global Textiles Pvt Ltd',
          vendorId: 'c4',
          purchaseOrderId: 'po1',
          billDate: '2025-12-10',
          dueDate: '2026-01-09',
          lineItems: [
            { id: 'li7', productId: '1', productName: 'Cotton Fabric', quantity: 100, unitPrice: 500, tax: 12, total: 56000 },
            { id: 'li8', productId: '2', productName: 'Polyester Thread', quantity: 50, unitPrice: 200, tax: 12, total: 11200 },
          ],
          subtotal: 60000,
          tax: 7200,
          total: 67200,
          paid: 67200,
          status: 'paid',
        },
        {
          id: 'vb2',
          billNumber: 'BILL-2025-002',
          vendor: 'Fashion Fabrics Inc',
          vendorId: 'c5',
          purchaseOrderId: 'po2',
          billDate: '2025-12-16',
          dueDate: '2026-01-15',
          lineItems: [
            { id: 'li9', productId: '3', productName: 'Silk Material', quantity: 25, unitPrice: 1200, tax: 12, total: 33600 },
          ],
          subtotal: 30000,
          tax: 3600,
          total: 33600,
          paid: 15000,
          status: 'partial',
        },
        {
          id: 'vb3',
          billNumber: 'BILL-2025-003',
          vendor: 'Premium Suppliers',
          vendorId: 'c6',
          billDate: '2025-11-25',
          dueDate: '2025-12-10',
          lineItems: [
            { id: 'li12', productId: '6', productName: 'Zipper Pack', quantity: 150, unitPrice: 80, tax: 12, total: 13440 },
          ],
          subtotal: 12000,
          tax: 1440,
          total: 13440,
          paid: 0,
          status: 'unpaid',
        },
      ];
      setVendorBills(initialVendorBills);
    }
  }, [products.length, contacts.length, paymentTerms.length, salesOrders.length, invoices.length, purchaseOrders.length, vendorBills.length]);

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