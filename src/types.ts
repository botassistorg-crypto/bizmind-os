export enum Tier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ELITE = 'ELITE',
}

export interface Product {
  id?: number;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  sku?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export interface Order {
  id?: number;
  date: string; // ISO string
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  isOutsideDhaka: boolean;
  items: OrderItem[];
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
}

export interface Expense {
  id?: number;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface UserSession {
  id?: string;
  mobile: string;
  licenseKey: string;
  deviceId: string;
  tier: Tier;
  settings: {
    storeName: string;
    storeAddress: string; // Added for invoice
    deliveryInside: number;
    deliveryOutside: number;
    googleSheetId: string; // Renamed for clarity
    customCategories: string[]; // User defined categories
  }
}