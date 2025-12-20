import { api } from './api';

// ============= TYPE DEFINITIONS =============

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  current_stock: number;
  category?: string;
  product_type: 'storable' | 'consumable' | 'service';
  image_url?: string;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  contact_type: 'customer' | 'vendor' | 'both';
  created_at: string;
}

export interface SaleOrderLine {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount: number;
}

export interface SaleOrder {
  id: number;
  order_number: string;
  customer_id: number;
  order_date: string;
  delivery_date?: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  status: 'draft' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  customer?: Contact;
  lines?: SaleOrderLine[];
}

export interface InvoiceLine {
  id?: number;
  product_id: number;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  sale_order_id?: number;
  customer_id: number;
  invoice_date: string;
  due_date?: string;
  total_amount: number;
  tax_amount: number;
  amount_paid: number;
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
  notes?: string;
  created_at: string;
  customer?: Contact;
  lines?: InvoiceLine[];
}

export interface PurchaseOrderLine {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  vendor_id: number;
  order_date: string;
  expected_delivery?: string;
  total_amount: number;
  tax_amount: number;
  status: 'draft' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  vendor?: Contact;
  lines?: PurchaseOrderLine[];
}

export interface VendorBillLine {
  id?: number;
  product_id: number;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface VendorBill {
  id: number;
  bill_number: string;
  purchase_order_id?: number;
  vendor_id: number;
  bill_date: string;
  due_date?: string;
  total_amount: number;
  tax_amount: number;
  amount_paid: number;
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
  notes?: string;
  created_at: string;
  vendor?: Contact;
  lines?: VendorBillLine[];
}

export interface Payment {
  id: number;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference?: string;
  invoice_id?: number;
  vendor_bill_id?: number;
  status: 'draft' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface PaymentTerm {
  id: number;
  name: string;
  days: number;
  discount_percentage: number;
  early_payment_days: number;
  early_payment_discount: number;
  description?: string;
  created_at: string;
}

// ============= PRODUCTS API =============

export const productsApi = {
  getAll: () => api.get<Product[]>('/admin/products'),
  getById: (id: number) => api.get<Product>(`/admin/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>('/admin/products', data),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/admin/products/${id}`),
};

// ============= CONTACTS API =============

export const contactsApi = {
  getAll: (type?: 'customer' | 'vendor') => {
    const params = type ? { contact_type: type } : {};
    return api.get<Contact[]>('/admin/contacts', { params });
  },
  getById: (id: number) => api.get<Contact>(`/admin/contacts/${id}`),
  create: (data: Partial<Contact>) => api.post<Contact>('/admin/contacts', data),
  update: (id: number, data: Partial<Contact>) => api.put<Contact>(`/admin/contacts/${id}`, data),
  delete: (id: number) => api.delete(`/admin/contacts/${id}`),
};

// ============= SALES ORDERS API =============

export const salesOrdersApi = {
  getAll: () => api.get<SaleOrder[]>('/admin/sales-orders'),
  getById: (id: number) => api.get<SaleOrder>(`/admin/sales-orders/${id}`),
  create: (data: {
    customer_id: number;
    order_date: string;
    delivery_date?: string;
    lines: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      tax_rate: number;
      discount: number;
    }>;
    notes?: string;
  }) => api.post<SaleOrder>('/admin/sales-orders', data),
  update: (id: number, data: {
    customer_id?: number;
    order_date?: string;
    delivery_date?: string;
    status?: 'draft' | 'confirmed' | 'cancelled';
    notes?: string;
  }) => api.put<SaleOrder>(`/admin/sales-orders/${id}`, data),
  delete: (id: number) => api.delete(`/admin/sales-orders/${id}`),
};

// ============= INVOICES API =============

export const invoicesApi = {
  getAll: () => api.get<Invoice[]>('/admin/invoices'),
  getById: (id: number) => api.get<Invoice>(`/admin/invoices/${id}`),
  create: (data: {
    customer_id: number;
    sale_order_id?: number;
    invoice_date: string;
    due_date?: string;
    lines: Array<{
      product_id: number;
      description?: string;
      quantity: number;
      unit_price: number;
      tax_rate: number;
    }>;
    notes?: string;
  }) => api.post<Invoice>('/admin/invoices', data),
  update: (id: number, data: {
    status?: 'draft' | 'confirmed' | 'paid' | 'cancelled';
    amount_paid?: number;
    notes?: string;
  }) => api.put<Invoice>(`/admin/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/admin/invoices/${id}`),
};

// ============= PURCHASE ORDERS API =============

export const purchaseOrdersApi = {
  getAll: () => api.get<PurchaseOrder[]>('/admin/purchase-orders'),
  getById: (id: number) => api.get<PurchaseOrder>(`/admin/purchase-orders/${id}`),
  create: (data: {
    vendor_id: number;
    order_date: string;
    expected_delivery?: string;
    lines: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      tax_rate: number;
    }>;
    notes?: string;
  }) => api.post<PurchaseOrder>('/admin/purchase-orders', data),
  update: (id: number, data: {
    vendor_id?: number;
    order_date?: string;
    expected_delivery?: string;
    status?: 'draft' | 'confirmed' | 'cancelled';
    notes?: string;
  }) => api.put<PurchaseOrder>(`/admin/purchase-orders/${id}`, data),
  delete: (id: number) => api.delete(`/admin/purchase-orders/${id}`),
};

// ============= VENDOR BILLS API =============

export const vendorBillsApi = {
  getAll: () => api.get<VendorBill[]>('/admin/vendor-bills'),
  getById: (id: number) => api.get<VendorBill>(`/admin/vendor-bills/${id}`),
  create: (data: {
    vendor_id: number;
    purchase_order_id?: number;
    bill_date: string;
    due_date?: string;
    lines: Array<{
      product_id: number;
      description?: string;
      quantity: number;
      unit_price: number;
      tax_rate: number;
    }>;
    notes?: string;
  }) => api.post<VendorBill>('/admin/vendor-bills', data),
  update: (id: number, data: {
    status?: 'draft' | 'confirmed' | 'paid' | 'cancelled';
    amount_paid?: number;
    notes?: string;
  }) => api.put<VendorBill>(`/admin/vendor-bills/${id}`, data),
  delete: (id: number) => api.delete(`/admin/vendor-bills/${id}`),
};

// ============= PAYMENTS API =============

export const paymentsApi = {
  getAll: () => api.get<Payment[]>('/admin/payments'),
  getById: (id: number) => api.get<Payment>(`/admin/payments/${id}`),
  create: (data: {
    payment_date: string;
    amount: number;
    payment_method: string;
    reference?: string;
    invoice_id?: number;
    vendor_bill_id?: number;
    notes?: string;
  }) => api.post<Payment>('/admin/payments', data),
  update: (id: number, data: {
    status?: 'draft' | 'confirmed' | 'cancelled';
    notes?: string;
  }) => api.put<Payment>(`/admin/payments/${id}`, data),
};

// ============= PAYMENT TERMS API =============

export const paymentTermsApi = {
  getAll: () => api.get<PaymentTerm[]>('/admin/payment-terms'),
  getById: (id: number) => api.get<PaymentTerm>(`/admin/payment-terms/${id}`),
  create: (data: Partial<PaymentTerm>) => api.post<PaymentTerm>('/admin/payment-terms', data),
  update: (id: number, data: Partial<PaymentTerm>) => api.put<PaymentTerm>(`/admin/payment-terms/${id}`, data),
  delete: (id: number) => api.delete(`/admin/payment-terms/${id}`),
};

// ============= HELPER FUNCTIONS =============

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
