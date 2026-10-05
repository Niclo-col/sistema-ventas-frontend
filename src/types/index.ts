export type UserRole = 'ADMIN' | 'SELLER';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  productCount?: number;
}

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  description?: string;
  priceUsd: number;
  barcode?: string;
  stock?: number;
  imageUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  priceUsd: number;
  subtotalUsd?: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId?: string;
  userName?: string;
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  totalUsd: number;
  totalVes: number;
  exchangeRate: number;
  paymentMethod: 'CASH' | 'CARD';
  amountReceivedUsd?: number;
  amountReceivedVes?: number;
  changeGivenUsd?: number;
  changeGivenVes?: number;
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING';
  createdAt: string;
}

export interface ExchangeRate {
  id?: string;
  rate: number;
  sourceCurrency: string;
  targetCurrency: string;
  effectiveAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StatsSummary {
  totalRevenueUsd: number;
  totalOrders: number;
  averageTicketUsd: number;
  totalItemsSold: number;
  revenueGrowthPercent?: number;
  ordersGrowthPercent?: number;
}

export interface PeriodStat {
  period: string; // e.g. "Lun", "Mar", "2026-10-01"
  revenueUsd: number;
  ordersCount: number;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  percentage: number;
  revenueUsd: number;
  itemsSold: number;
}

export interface ProductStat {
  productId: string;
  productName: string;
  categoryName?: string;
  unitsSold: number;
  revenueUsd: number;
}

export interface DeviceSetting {
  id: string;
  name: string;
  type: 'printer' | 'scanner';
  connectionType: 'network' | 'bluetooth' | 'usb';
  address: string;
  status: 'connected' | 'disconnected';
  location: string;
}
