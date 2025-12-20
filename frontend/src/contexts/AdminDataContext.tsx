import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Types
export type ProductStatus = 'new' | 'confirmed' | 'archived';
export type OrderStatus = 'draft' | 'confirmed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'partial' | 'unpaid' | 'cancelled';
export type UserRole = 'internal' | 'portal';
export type ContactType = 'customer' | 'vendor' | 'both';

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  type: string;
  material?: string;
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
  price: number; // For compatibility
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  paymentTerm?: string;
  date: string;
  lineItems: LineItem[];
  couponCode?: string;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerId: string;
  salesOrderId?: string;
  paymentTerm?: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  status: InvoiceStatus;
  paidDate?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendor: string;
  vendorId: string;
  date: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  vendor: string;
  vendorId: string;
  purchaseOrderId?: string;
  billDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  status: InvoiceStatus;
}

export interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  status: 'active' | 'archived';
  confirmed: boolean;
}

export interface Contact {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  type: ContactType;
  status: 'active' | 'archived';
}

export interface PaymentTerm {
  id: string;
  name: string;
  earlyPaymentDiscount: boolean;
  discountPercentage?: number;
  discountDays?: number;
  discountComputation?: 'base' | 'total';
  active: boolean;
}

export interface Offer {
  id: string;
  name: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  availableOn: 'sales' | 'website' | 'both';
  targetType: ContactType;
}

export interface Coupon {
  id: string;
  code: string;
  offerId: string;
  offerName: string;
  customerId?: string;
  customerName?: string;
  validUntil: string;
  used: boolean;
  usedDate?: string;
}

interface AdminDataContextType {
  // Products
  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, 'id'>) => string;
  updateProduct: (id: string, product: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  
  // Sales Orders
  salesOrders: SalesOrder[];
  addSalesOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber'>) => string;
  updateSalesOrder: (id: string, order: Partial<SalesOrder>) => void;
  
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => string;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  
  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => string;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => void;
  
  // Vendor Bills
  vendorBills: VendorBill[];
  addVendorBill: (bill: Omit<VendorBill, 'id' | 'billNumber'>) => string;
  updateVendorBill: (id: string, bill: Partial<VendorBill>) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>) => string;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => string;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  // Payment Terms
  paymentTerms: PaymentTerm[];
  addPaymentTerm: (term: Omit<PaymentTerm, 'id'>) => string;
  updatePaymentTerm: (id: string, term: Partial<PaymentTerm>) => void;
  deletePaymentTerm: (id: string) => void;
  
  // Offers
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id'>) => string;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  
  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => string;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  
  // Settings
  autoInvoicing: boolean;
  setAutoInvoicing: (value: boolean) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Generate sequential numbers
let salesOrderCounter = 1;
let invoiceCounter = 1;
let purchaseOrderCounter = 1;
let vendorBillCounter = 1;

const generateOrderNumber = (prefix: string, counter: number): string => {
  return `${prefix}-${String(counter).padStart(3, '0')}`;
};

// Helper to generate UUIDs safely in non-secure contexts (HTTP)
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for HTTP/IP access
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or initialize
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(`admin_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const saveToStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(`admin_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const [products, setProducts] = useState<AdminProduct[]>(() => 
    loadFromStorage('products', [])
  );
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => 
    loadFromStorage('salesOrders', [])
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() => 
    loadFromStorage('invoices', [])
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => 
    loadFromStorage('purchaseOrders', [])
  );
  const [vendorBills, setVendorBills] = useState<VendorBill[]>(() => 
    loadFromStorage('vendorBills', [])
  );
  const [users, setUsers] = useState<User[]>(() => 
    loadFromStorage('users', [])
  );
  const [contacts, setContacts] = useState<Contact[]>(() => 
    loadFromStorage('contacts', [])
  );
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(() => 
    loadFromStorage('paymentTerms', [])
  );
  const [offers, setOffers] = useState<Offer[]>(() => 
    loadFromStorage('offers', [])
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() => 
    loadFromStorage('coupons', [])
  );
  const [autoInvoicing, setAutoInvoicingState] = useState(() => 
    loadFromStorage('autoInvoicing', true)
  );

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage('products', products);
  }, [products]);

  useEffect(() => {
    saveToStorage('salesOrders', salesOrders);
  }, [salesOrders]);

  useEffect(() => {
    saveToStorage('invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    saveToStorage('purchaseOrders', purchaseOrders);
  }, [purchaseOrders]);

  useEffect(() => {
    saveToStorage('vendorBills', vendorBills);
  }, [vendorBills]);

  useEffect(() => {
    saveToStorage('users', users);
  }, [users]);

  useEffect(() => {
    saveToStorage('contacts', contacts);
  }, [contacts]);

  useEffect(() => {
    saveToStorage('paymentTerms', paymentTerms);
  }, [paymentTerms]);

  useEffect(() => {
    saveToStorage('offers', offers);
  }, [offers]);

  useEffect(() => {
    saveToStorage('coupons', coupons);
  }, [coupons]);

  useEffect(() => {
    saveToStorage('autoInvoicing', autoInvoicing);
  }, [autoInvoicing]);

  // Products
  const addProduct = useCallback((product: Omit<AdminProduct, 'id'>): string => {
    const id = generateUUID();
    const newProduct: AdminProduct = {
      ...product,
      id,
      price: product.salesPrice, // For compatibility
    };
    setProducts(prev => [...prev, newProduct]);
    return id;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<AdminProduct>) => {
    setProducts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, price: updates.salesPrice ?? p.salesPrice }
        : p
    ));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Sales Orders
  const addSalesOrder = useCallback((order: Omit<SalesOrder, 'id' | 'orderNumber'>): string => {
    const id = generateUUID();
    const orderNumber = generateOrderNumber('SO', salesOrderCounter++);
    const newOrder: SalesOrder = { ...order, id, orderNumber };
    setSalesOrders(prev => [...prev, newOrder]);
    return id;
  }, []);

  const updateSalesOrder = useCallback((id: string, updates: Partial<SalesOrder>) => {
    setSalesOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  // Invoices
  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): string => {
    const id = generateUUID();
    const invoiceNumber = generateOrderNumber('INV', invoiceCounter++);
    const newInvoice: Invoice = { ...invoice, id, invoiceNumber };
    setInvoices(prev => [...prev, newInvoice]);
    return id;
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  // Purchase Orders
  const addPurchaseOrder = useCallback((order: Omit<PurchaseOrder, 'id' | 'orderNumber'>): string => {
    const id = generateUUID();
    const orderNumber = generateOrderNumber('PO', purchaseOrderCounter++);
    const newOrder: PurchaseOrder = { ...order, id, orderNumber };
    setPurchaseOrders(prev => [...prev, newOrder]);
    return id;
  }, []);

  const updatePurchaseOrder = useCallback((id: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  // Vendor Bills
  const addVendorBill = useCallback((bill: Omit<VendorBill, 'id' | 'billNumber'>): string => {
    const id = generateUUID();
    const billNumber = generateOrderNumber('BILL', vendorBillCounter++);
    const newBill: VendorBill = { ...bill, id, billNumber };
    setVendorBills(prev => [...prev, newBill]);
    return id;
  }, []);

  const updateVendorBill = useCallback((id: string, updates: Partial<VendorBill>) => {
    setVendorBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  // Users
  const addUser = useCallback((user: Omit<User, 'id'>): string => {
    const id = generateUUID();
    setUsers(prev => [...prev, { ...user, id }]);
    return id;
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  // Contacts
  const addContact = useCallback((contact: Omit<Contact, 'id'>): string => {
    const id = generateUUID();
    setContacts(prev => [...prev, { ...contact, id }]);
    return id;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  // Payment Terms
  const addPaymentTerm = useCallback((term: Omit<PaymentTerm, 'id'>): string => {
    const id = generateUUID();
    setPaymentTerms(prev => [...prev, { ...term, id }]);
    return id;
  }, []);

  const updatePaymentTerm = useCallback((id: string, updates: Partial<PaymentTerm>) => {
    setPaymentTerms(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deletePaymentTerm = useCallback((id: string) => {
    setPaymentTerms(prev => prev.filter(t => t.id !== id));
  }, []);

  // Offers
  const addOffer = useCallback((offer: Omit<Offer, 'id'>): string => {
    const id = generateUUID();
    setOffers(prev => [...prev, { ...offer, id }]);
    return id;
  }, []);

  const updateOffer = useCallback((id: string, updates: Partial<Offer>) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  }, []);

  // Coupons
  const addCoupon = useCallback((coupon: Omit<Coupon, 'id'>): string => {
    const id = generateUUID();
    setCoupons(prev => [...prev, { ...coupon, id }]);
    return id;
  }, []);

  const updateCoupon = useCallback((id: string, updates: Partial<Coupon>) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const setAutoInvoicing = useCallback((value: boolean) => {
    setAutoInvoicingState(value);
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        salesOrders,
        addSalesOrder,
        updateSalesOrder,
        invoices,
        addInvoice,
        updateInvoice,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        vendorBills,
        addVendorBill,
        updateVendorBill,
        users,
        addUser,
        updateUser,
        deleteUser,
        contacts,
        addContact,
        updateContact,
        deleteContact,
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
        updateCoupon,
        autoInvoicing,
        setAutoInvoicing,
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