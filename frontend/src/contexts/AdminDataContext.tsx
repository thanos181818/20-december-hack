import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api, API_URL } from '@/lib/api';
import { toast } from 'sonner';
import {
  productsApi,
  contactsApi,
  salesOrdersApi,
  invoicesApi,
  purchaseOrdersApi,
  vendorBillsApi,
  paymentsApi,
  paymentTermsApi,
  type Product as BackendProduct,
  type Contact as BackendContact,
  type SaleOrder as BackendSaleOrder,
  type Invoice as BackendInvoice,
  type PurchaseOrder as BackendPurchaseOrder,
  type VendorBill as BackendVendorBill,
  type PaymentTerm as BackendPaymentTerm,
} from '@/lib/adminApi';

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

export interface LineItem { id: string; productId: string; productName: string; quantity: number; unitPrice: number; tax: number; discount?: number; total: number; }
export interface SalesOrder { id: string; orderNumber: string; customer: string; customerId: string; paymentTerm?: string; date: string; lineItems: LineItem[]; couponCode?: string; discount: number; subtotal: number; tax: number; total: number; status: OrderStatus; }
export interface Invoice { id: string; invoiceNumber: string; customer: string; customerId: string; salesOrderId?: string; paymentTerm?: string; invoiceDate: string; dueDate: string; lineItems: LineItem[]; subtotal: number; tax: number; total: number; paid: number; status: InvoiceStatus; paidDate?: string; }
export interface PurchaseOrder { id: string; orderNumber: string; vendor: string; vendorId: string; date: string; lineItems: LineItem[]; subtotal: number; tax: number; total: number; status: OrderStatus; }
export interface VendorBill { id: string; billNumber: string; vendor: string; vendorId: string; purchaseOrderId?: string; billDate: string; dueDate: string; lineItems: LineItem[]; subtotal: number; tax: number; total: number; paid: number; status: InvoiceStatus; }
export interface User { id: string; name: string; email: string; phone?: string; address?: string; role: UserRole; status: 'active' | 'archived'; confirmed: boolean; }
export interface Contact { id: string; name?: string; email?: string; phone?: string; address?: string; type: ContactType; status: 'active' | 'archived'; }
export interface PaymentTerm { id: string; name: string; earlyPaymentDiscount: boolean; discountPercentage?: number; discountDays?: number; discountComputation?: 'base' | 'total'; active: boolean; }
export interface Offer {
  id: string;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  availableOn: 'sales' | 'website' | 'both';
  status: 'active' | 'upcoming' | 'expired';
}

export interface Coupon {
  id: string;
  code: string;
  offerId: string;
  offerName: string;
  validUntil: string;
  customerName?: string;
  status: 'unused' | 'used';
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    name: 'John Admin',
    email: 'john@appareldesk.com',
    phone: '+91 9876543210',
    address: '123 Main St, Mumbai, Maharashtra',
    role: 'internal',
    status: 'active',
    confirmed: true,
  },
  {
    id: 'user-2',
    name: 'Jane Staff',
    email: 'jane@appareldesk.com',
    phone: '+91 9876543211',
    address: '456 Park Ave, Delhi, NCR',
    role: 'internal',
    status: 'active',
    confirmed: true,
  },
  {
    id: 'user-3',
    name: 'Customer One',
    email: 'customer1@email.com',
    phone: '+91 9876543212',
    address: '789 Garden Road, Bangalore, Karnataka',
    role: 'portal',
    status: 'active',
    confirmed: true,
  },
  {
    id: 'user-4',
    name: 'Customer Two',
    email: 'customer2@email.com',
    phone: '+91 9876543213',
    address: '321 Lake View, Pune, Maharashtra',
    role: 'portal',
    status: 'active',
    confirmed: true,
  },
  {
    id: 'user-5',
    name: 'Customer Three',
    email: 'customer3@email.com',
    phone: '+91 9876543214',
    address: '654 Hill Station, Chennai, Tamil Nadu',
    role: 'portal',
    status: 'archived',
    confirmed: true,
  },
];

const DEFAULT_OFFERS: Offer[] = [
  { id: 'offer-1', name: 'Holiday Sale', discount: 20, startDate: '2025-12-01', endDate: '2025-12-31', availableOn: 'website', status: 'active' },
  { id: 'offer-2', name: 'Bulk Discount', discount: 15, startDate: '2025-01-01', endDate: '2025-12-31', availableOn: 'sales', status: 'active' },
  { id: 'offer-3', name: 'New Year Special', discount: 25, startDate: '2025-12-25', endDate: '2026-01-05', availableOn: 'website', status: 'active' },
];

const DEFAULT_COUPONS: Coupon[] = [
  { id: 'coupon-1', code: 'HOLIDAY20', offerId: 'offer-1', offerName: 'Holiday Sale', validUntil: '2025-12-31', status: 'unused' },
  { id: 'coupon-2', code: 'BULK15A', offerId: 'offer-2', offerName: 'Bulk Discount', validUntil: '2025-12-31', customerName: 'John Doe', status: 'used' },
  { id: 'coupon-3', code: 'NEWYEAR25', offerId: 'offer-3', offerName: 'New Year Special', validUntil: '2026-01-05', customerName: 'Jane Smith', status: 'unused' },
];

const STORAGE_VERSION = '2';
const STORAGE_VERSION_KEY = 'admin_data_version';

const STORAGE_KEYS = {
  users: 'admin_users',
  offers: 'admin_offers',
  coupons: 'admin_coupons',
} as const;

const ensureStorageVersion = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const currentVersion = window.localStorage.getItem(STORAGE_VERSION_KEY);
  if (currentVersion === STORAGE_VERSION) {
    return;
  }
  Object.values(STORAGE_KEYS).forEach(key => window.localStorage.removeItem(key));
  window.localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
};

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  ensureStorageVersion();
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch (error) {
    console.warn('Failed to load admin data from storage', error);
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save admin data to storage', error);
  }
};

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
  deleteInvoice: (id: string) => void;
  
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
  
  refreshData: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Helper for temporary IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEYS.users, DEFAULT_USERS));
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [offers, setOffers] = useState<Offer[]>(() => loadFromStorage(STORAGE_KEYS.offers, DEFAULT_OFFERS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadFromStorage(STORAGE_KEYS.coupons, DEFAULT_COUPONS));
  const [autoInvoicing, setAutoInvoicing] = useState(true);
  const [loading, setLoading] = useState(true);
  const productNameMapRef = useRef(new Map<string, string>());
  const contactNameMapRef = useRef(new Map<string, string>());

  const getContactName = useCallback((id?: number | string, fallback?: string) => {
    if (id === undefined || id === null) {
      return fallback || 'Unknown';
    }
    return contactNameMapRef.current.get(id.toString()) || fallback || 'Unknown';
  }, []);

  const getProductName = useCallback((id?: number | string) => {
    if (id === undefined || id === null) {
      return 'Unknown Product';
    }
    const key = id.toString();
    return productNameMapRef.current.get(key) || `Product ${key}`;
  }, []);

  const mapSalesOrder = useCallback((so: BackendSaleOrder): SalesOrder => {
    const totals = calculateSalesOrderTotals(so);
    return {
      id: so.id.toString(),
      orderNumber: so.order_number,
      customer: getContactName(so.customer_id, so.customer?.name),
      customerId: so.customer_id.toString(),
      paymentTerm: undefined,
      date: so.order_date,
      lineItems: so.lines?.map(line => {
        const lineDiscount = line.discount ?? 0;
        const base = line.unit_price * line.quantity - lineDiscount;
        const taxAmount = base * ((line.tax_rate ?? 0) / 100);
        return {
          id: line.id?.toString() || '',
          productId: line.product_id.toString(),
          productName: getProductName(line.product_id),
          quantity: line.quantity,
          unitPrice: line.unit_price,
          tax: line.tax_rate,
          discount: lineDiscount,
          total: base + taxAmount,
        };
      }) || [],
      couponCode: so.notes || undefined,
      discount: totals.discount,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      status: so.status as OrderStatus,
    };
  }, [getContactName, getProductName]);

  const mapInvoiceFromBackend = useCallback((inv: BackendInvoice): Invoice => {
    const totals = calculateInvoiceTotals(inv);
    return {
      id: inv.id.toString(),
      invoiceNumber: inv.invoice_number,
      customer: getContactName(inv.customer_id, inv.customer?.name),
      customerId: inv.customer_id.toString(),
      salesOrderId: inv.sale_order_id?.toString(),
      invoiceDate: inv.invoice_date,
      dueDate: inv.due_date || inv.invoice_date,
      lineItems: inv.lines?.map(line => {
        const base = line.unit_price * line.quantity;
        const taxAmount = base * ((line.tax_rate ?? 0) / 100);
        return {
          id: line.id?.toString() || '',
          productId: line.product_id.toString(),
          productName: line.description || getProductName(line.product_id),
          quantity: line.quantity,
          unitPrice: line.unit_price,
          tax: line.tax_rate,
          total: base + taxAmount,
        };
      }) || [],
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      paid: inv.amount_paid,
      status: inv.status === 'paid' ? 'paid' : inv.amount_paid > 0 ? 'partial' : inv.status as InvoiceStatus,
    };
  }, [getContactName, getProductName]);

  // Persist local-only collections so admin changes survive reloads
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.offers, offers);
  }, [offers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.coupons, coupons);
  }, [coupons]);

  // Helper to map backend product to admin product
  const mapBackendProduct = (bp: BackendProduct): AdminProduct => ({
    id: bp.id.toString(),
    name: bp.name,
    category: 'men', // Default, can be inferred from category field
    type: 'shirts', // Default, can be inferred from category field
    material: 'cotton', // Default
    colors: ['Blue'], // Default
    stock: bp.current_stock,
    salesPrice: bp.price,
    salesTax: 18,
    purchasePrice: bp.price * 0.6,
    purchaseTax: 12,
    published: true,
    status: 'confirmed',
    description: bp.description || '',
    images: bp.image_url ? [bp.image_url] : ['https://placehold.co/600x800/e2e8f0/1e293b?text=' + encodeURIComponent(bp.name)],
    price: bp.price,
  });

  // Helper to map backend contact to admin contact
  const mapBackendContact = (bc: BackendContact): Contact => ({
    id: bc.id.toString(),
    name: bc.name,
    email: bc.email,
    phone: bc.phone,
    address: bc.address,
    type: bc.contact_type as ContactType,
    status: 'active',
  });

  // Helper to map backend payment term to admin payment term
  const mapBackendPaymentTerm = (bpt: BackendPaymentTerm): PaymentTerm => ({
    id: bpt.id.toString(),
    name: bpt.name,
    earlyPaymentDiscount: bpt.early_payment_discount > 0,
    discountPercentage: bpt.early_payment_discount,
    discountDays: bpt.early_payment_days,
    discountComputation: 'base',
    active: true,
  });

  const calculateSalesOrderTotals = (order: BackendSaleOrder) => {
    const taxAmount = order.tax_amount ?? 0;
    const totalAmount = order.total_amount ?? 0;
    return {
      subtotal: Math.max(0, totalAmount - taxAmount),
      tax: taxAmount,
      total: totalAmount,
      discount: order.discount_amount || 0,
    };
  };

  const calculateInvoiceTotals = (invoice: BackendInvoice) => {
    const taxAmount = invoice.tax_amount ?? 0;
    const totalAmount = invoice.total_amount ?? 0;
    return {
      subtotal: Math.max(0, totalAmount - taxAmount),
      tax: taxAmount,
      total: totalAmount,
    };
  };

  // Fetch all data from backend
  const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsRes = await productsApi.getAll();
        productNameMapRef.current = new Map(productsRes.data.map(product => [product.id.toString(), product.name]));
        setProducts(productsRes.data.map(mapBackendProduct));
        
        // Fetch contacts
        const contactsRes = await contactsApi.getAll();
        contactNameMapRef.current = new Map(contactsRes.data.map(contact => [contact.id.toString(), contact.name || 'Unknown']));
        setContacts(contactsRes.data.map(mapBackendContact));
        
        // Fetch payment terms
        const paymentTermsRes = await paymentTermsApi.getAll();
        setPaymentTerms(paymentTermsRes.data.map(mapBackendPaymentTerm));
        
        // Fetch sales orders, invoices, purchase orders, vendor bills
        const [salesOrdersRes, invoicesRes, purchaseOrdersRes, vendorBillsRes] = await Promise.all([
          salesOrdersApi.getAll(),
          invoicesApi.getAll(),
          purchaseOrdersApi.getAll(),
          vendorBillsApi.getAll(),
        ]);
        
        // Map sales orders
        setSalesOrders(salesOrdersRes.data.map(mapSalesOrder));
        
        // Map invoices
        setInvoices(invoicesRes.data.map(mapInvoiceFromBackend));
        
        // Map purchase orders
        setPurchaseOrders(purchaseOrdersRes.data.map((po): PurchaseOrder => ({
          id: po.id.toString(),
          orderNumber: po.order_number,
          vendor: getContactName(po.vendor_id, po.vendor?.name),
          vendorId: po.vendor_id.toString(),
          date: po.order_date,
          lineItems: po.lines?.map(line => ({
            id: line.id?.toString() || '',
            productId: line.product_id.toString(),
            productName: getProductName(line.product_id),
            quantity: line.quantity,
            unitPrice: line.unit_price,
            tax: line.tax_rate,
            total: line.quantity * line.unit_price * (1 + line.tax_rate / 100),
          })) || [],
          subtotal: po.total_amount - po.tax_amount,
          tax: po.tax_amount,
          total: po.total_amount,
          status: po.status as OrderStatus,
        })));
        
        // Map vendor bills
        setVendorBills(vendorBillsRes.data.map((bill): VendorBill => ({
          id: bill.id.toString(),
          billNumber: bill.bill_number,
          vendor: getContactName(bill.vendor_id, bill.vendor?.name),
          vendorId: bill.vendor_id.toString(),
          purchaseOrderId: bill.purchase_order_id?.toString(),
          billDate: bill.bill_date,
          dueDate: bill.due_date || bill.bill_date,
          lineItems: bill.lines?.map(line => ({
            id: line.id?.toString() || '',
            productId: line.product_id.toString(),
            productName: line.description || getProductName(line.product_id),
            quantity: line.quantity,
            unitPrice: line.unit_price,
            tax: line.tax_rate,
            total: line.quantity * line.unit_price * (1 + line.tax_rate / 100),
          })) || [],
          subtotal: bill.total_amount - bill.tax_amount,
          tax: bill.tax_amount,
          total: bill.total_amount,
          paid: bill.amount_paid,
          status: bill.status === 'paid' ? 'paid' : bill.amount_paid > 0 ? 'partial' : bill.status as InvoiceStatus,
        })));
        
        toast.success('Data loaded from backend successfully');
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data from backend: ' + (error.response?.data?.detail || error.message));
        
        // Initialize with minimal dummy data on error
        if (products.length === 0) {
          const fallbackProducts: AdminProduct[] = [
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
            }
          ];
          setProducts(fallbackProducts);
        }
      } finally {
        setLoading(false);
      }
  }, [mapSalesOrder, mapInvoiceFromBackend, getContactName, getProductName]);
    
  // Initial data fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Products
  const addProduct = useCallback(async (product: Omit<AdminProduct, 'id'>) => {
    try {
      const res = await productsApi.create({
        name: product.name,
        description: product.description,
        price: product.salesPrice,
        current_stock: product.stock,
        category: product.category,
        product_type: 'storable',
        image_url: product.images[0],
      });
      // Map backend product and preserve the status/published from form
      const baseProduct = mapBackendProduct(res.data);
      const newProduct: AdminProduct = {
        ...baseProduct,
        status: product.status || 'new',
        published: product.published ?? false,
        category: product.category,
        type: product.type,
        material: product.material,
        colors: product.colors,
        salesTax: product.salesTax,
        purchasePrice: product.purchasePrice,
        purchaseTax: product.purchaseTax,
        images: product.images.length > 0 ? product.images : baseProduct.images,
      };
      setProducts(prev => [...prev, newProduct]);
      productNameMapRef.current.set(newProduct.id, newProduct.name);
      toast.success('Product added successfully');
      return newProduct.id;
    } catch (error: any) {
      toast.error('Failed to add product: ' + (error.response?.data?.detail || error.message));
      return '';
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<AdminProduct>) => {
    try {
      await productsApi.update(parseInt(id), {
        name: updates.name,
        description: updates.description,
        price: updates.salesPrice,
        current_stock: updates.stock,
        category: updates.category,
        image_url: updates.images?.[0],
      });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      if (updates.name) {
        productNameMapRef.current.set(id, updates.name);
      }
      toast.success('Product updated successfully');
    } catch (error: any) {
      toast.error('Failed to update product: ' + (error.response?.data?.detail || error.message));
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productsApi.delete(parseInt(id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete product: ' + (error.response?.data?.detail || error.message));
    }
  }, []);

  // Sales Orders
  const addSalesOrder = async (o: Omit<SalesOrder, 'id'>) => {
    try {
      const grossSubtotal = o.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const totalDiscount = o.discount || 0;
      const payloadLines = o.lineItems.map(item => {
        const lineSubtotal = item.quantity * item.unitPrice;
        const discountShare = grossSubtotal > 0 ? (lineSubtotal / grossSubtotal) * totalDiscount : 0;
        return {
          product_id: parseInt(item.productId, 10),
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.tax,
          discount: Number(discountShare.toFixed(2)),
        };
      });

      const res = await salesOrdersApi.create({
        customer_id: parseInt(o.customerId, 10),
        order_date: o.date,
        delivery_date: undefined,
        lines: payloadLines,
        notes: o.couponCode || undefined,
      });

      const fullOrder = await salesOrdersApi.getById(res.data.id);
      const mappedOrder = mapSalesOrder(fullOrder.data);
      setSalesOrders(p => [...p, mappedOrder]);
      toast.success('Sales order created successfully');
      return mappedOrder.id;
    } catch (error: any) {
      toast.error('Failed to create sales order: ' + (error.response?.data?.detail || error.message));
      return '';
    }
  };
  
  const updateSalesOrder = async (id: string, o: Partial<SalesOrder>) => {
    try {
      await salesOrdersApi.update(parseInt(id), {
        status: o.status as any,
      });
      setSalesOrders(p => p.map(i => i.id === id ? {...i, ...o} : i));
      toast.success('Sales order updated successfully');
    } catch (error: any) {
      toast.error('Failed to update sales order: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  // Invoices
  const addInvoice = async (i: Omit<Invoice, 'id'>) => {
    try {
      // Validate line items
      if (!i.lineItems || i.lineItems.length === 0) {
        toast.error('Cannot create invoice: No line items');
        console.error('Invoice creation failed: lineItems is empty', i);
        return '';
      }

      // Calculate discounted unit price so backend computes correct totals
      const payloadLines = i.lineItems.map(item => {
        const lineGross = item.quantity * item.unitPrice;
        const lineDiscount = item.discount ?? 0;
        // Distribute discount across units
        const discountedUnitPrice = item.quantity > 0
          ? (lineGross - lineDiscount) / item.quantity
          : item.unitPrice;
        return {
          product_id: parseInt(item.productId, 10),
          description: item.productName,
          quantity: item.quantity,
          unit_price: Number(discountedUnitPrice.toFixed(2)),
          tax_rate: item.tax,
        };
      });

      console.log('Creating invoice with lines:', payloadLines);

      const res = await invoicesApi.create({
        customer_id: parseInt(i.customerId, 10),
        sale_order_id: i.salesOrderId ? parseInt(i.salesOrderId, 10) : undefined,
        invoice_date: i.invoiceDate,
        due_date: i.dueDate,
        lines: payloadLines,
        notes: '',
      });

      const fullInvoice = await invoicesApi.getById(res.data.id);
      const mappedInvoice = mapInvoiceFromBackend(fullInvoice.data);
      setInvoices(p => [...p, mappedInvoice]);
      toast.success('Invoice created successfully');
      return mappedInvoice.id;
    } catch (error: any) {
      toast.error('Failed to create invoice: ' + (error.response?.data?.detail || error.message));
      return '';
    }
  };
  
  const updateInvoice = async (id: string, i: Partial<Invoice>) => {
    try {
      await invoicesApi.update(parseInt(id), {
        status: i.status as any,
        amount_paid: i.paid,
      });
      setInvoices(p => p.map(x => x.id === id ? {...x, ...i} : x));
      toast.success('Invoice updated successfully');
    } catch (error: any) {
      toast.error('Failed to update invoice: ' + (error.response?.data?.detail || error.message));
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await invoicesApi.delete(parseInt(id));
      setInvoices(p => p.filter(x => x.id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete invoice: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  // Purchase Orders
  const addPurchaseOrder = async (o: Omit<PurchaseOrder, 'id'>) => {
    try {
      const res = await purchaseOrdersApi.create({
        vendor_id: parseInt(o.vendorId),
        order_date: o.date,
        lines: o.lineItems.map(item => ({
          product_id: parseInt(item.productId),
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.tax,
        })),
        notes: '',
      });
      const newOrder: PurchaseOrder = {
        id: res.data.id.toString(),
        orderNumber: res.data.order_number,
        vendor: o.vendor,
        vendorId: o.vendorId,
        date: o.date,
        lineItems: o.lineItems,
        subtotal: o.subtotal,
        tax: o.tax,
        total: o.total,
        status: res.data.status as OrderStatus,
      };
      setPurchaseOrders(p => [...p, newOrder]);
      toast.success('Purchase order created successfully');
      return newOrder.id;
    } catch (error: any) {
      toast.error('Failed to create purchase order: ' + (error.response?.data?.detail || error.message));
      return '';
    }
  };
  
  const updatePurchaseOrder = async (id: string, o: Partial<PurchaseOrder>) => {
    try {
      await purchaseOrdersApi.update(parseInt(id), {
        status: o.status as any,
      });
      setPurchaseOrders(p => p.map(i => i.id === id ? {...i, ...o} : i));
      toast.success('Purchase order updated successfully');
    } catch (error: any) {
      toast.error('Failed to update purchase order: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  // Vendor Bills
  const addVendorBill = async (b: Omit<VendorBill, 'id'>) => {
    try {
      const res = await vendorBillsApi.create({
        vendor_id: parseInt(b.vendorId),
        purchase_order_id: b.purchaseOrderId ? parseInt(b.purchaseOrderId) : undefined,
        bill_date: b.billDate,
        due_date: b.dueDate,
        lines: b.lineItems.map(item => ({
          product_id: parseInt(item.productId),
          description: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.tax,
        })),
        notes: '',
      });
      const newBill: VendorBill = {
        id: res.data.id.toString(),
        billNumber: res.data.bill_number,
        vendor: b.vendor,
        vendorId: b.vendorId,
        purchaseOrderId: b.purchaseOrderId,
        billDate: b.billDate,
        dueDate: b.dueDate,
        lineItems: b.lineItems,
        subtotal: b.subtotal,
        tax: b.tax,
        total: b.total,
        paid: 0,
        status: res.data.status as InvoiceStatus,
      };
      setVendorBills(p => [...p, newBill]);
      toast.success('Vendor bill created successfully');
      return newBill.id;
    } catch (error: any) {
      toast.error('Failed to create vendor bill: ' + (error.response?.data?.detail || error.message));
      return '';
    }
  };
  
  const updateVendorBill = async (id: string, b: Partial<VendorBill>) => {
    try {
      await vendorBillsApi.update(parseInt(id), {
        status: b.status as any,
        amount_paid: b.paid,
      });
      setVendorBills(p => p.map(i => i.id === id ? {...i, ...b} : i));
      toast.success('Vendor bill updated successfully');
    } catch (error: any) {
      toast.error('Failed to update vendor bill: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  // Users (no backend API yet - keep local)
  const addUser = (u: Omit<User, 'id'>) => { const id = generateId(); setUsers(p => [...p, {...u, id}]); return id; };
  const updateUser = (id: string, u: Partial<User>) => setUsers(p => p.map(i => i.id === id ? {...i, ...u} : i));
  const deleteUser = (id: string) => setUsers(p => p.filter(i => i.id !== id));
  
  // Contacts
  const addContact = async (c: Omit<Contact, 'id'>) => {
    try {
      const res = await contactsApi.create({
        name: c.name || '',
        email: c.email || '',
        phone: c.phone,
        address: c.address,
        contact_type: c.type,
      });
      const newContact = mapBackendContact(res.data);
      setContacts(p => [...p, newContact]);
      contactNameMapRef.current.set(newContact.id, newContact.name || 'Unknown');
      toast.success('Contact added successfully');
      return newContact.id;
    } catch (error: any) {
      toast.error('Failed to add contact: ' + (error.response?.data?.detail || error.message));
      return '';
    }
  };
  
  const updateContact = async (id: string, c: Partial<Contact>) => {
    try {
      await contactsApi.update(parseInt(id), {
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        contact_type: c.type as any,
      });
      setContacts(p => p.map(i => i.id === id ? {...i, ...c} : i));
      if (c.name) {
        contactNameMapRef.current.set(id, c.name);
      }
      toast.success('Contact updated successfully');
    } catch (error: any) {
      toast.error('Failed to update contact: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  const deleteContact = async (id: string) => {
    try {
      await contactsApi.delete(parseInt(id));
      setContacts(p => p.filter(i => i.id !== id));
      contactNameMapRef.current.delete(id);
      toast.success('Contact deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete contact: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  // Payment Terms
  const addPaymentTerm = async (t: Omit<PaymentTerm, 'id'>) => {
    try {
      const res = await paymentTermsApi.create({
        name: t.name,
        days: 30,
        discount_percentage: 0,
        early_payment_days: t.discountDays || 0,
        early_payment_discount: t.discountPercentage || 0,
        description: '',
      });
      const newTerm = mapBackendPaymentTerm(res.data);
      setPaymentTerms(p => [...p, newTerm]);
      toast.success('Payment term added successfully');
      return newTerm.id;
    } catch (error: any) {
      toast.error('Failed to add payment term: ' + (error.response?.data?.detail || error.message));
      return '';
    }
  };
  
  const updatePaymentTerm = async (id: string, t: Partial<PaymentTerm>) => {
    try {
      await paymentTermsApi.update(parseInt(id), {
        name: t.name,
        early_payment_days: t.discountDays,
        early_payment_discount: t.discountPercentage,
      });
      setPaymentTerms(p => p.map(i => i.id === id ? {...i, ...t} : i));
      toast.success('Payment term updated successfully');
    } catch (error: any) {
      toast.error('Failed to update payment term: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  const deletePaymentTerm = async (id: string) => {
    try {
      await paymentTermsApi.delete(parseInt(id));
      setPaymentTerms(p => p.filter(i => i.id !== id));
      toast.success('Payment term deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete payment term: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  // Offers & Coupons (no backend API yet - keep local)
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
        invoices, addInvoice, updateInvoice, deleteInvoice,
        purchaseOrders, addPurchaseOrder, updatePurchaseOrder,
        vendorBills, addVendorBill, updateVendorBill,
        users, addUser, updateUser, deleteUser,
        contacts, addContact, updateContact, deleteContact,
        paymentTerms, addPaymentTerm, updatePaymentTerm, deletePaymentTerm,
        offers, addOffer, updateOffer, deleteOffer,
        coupons, addCoupon, updateCoupon,
        autoInvoicing, setAutoInvoicing,
        refreshData: fetchData,
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