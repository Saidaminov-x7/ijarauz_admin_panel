export interface ProductTranslation {
  title: string;
  description: string;
  slug?: string;
}

export interface AdminProduct {
  id: string;
  sku: string;
  sourceUrl?: string;
  price: number;
  oldPrice?: number | null;
  currency: string;
  stock: number;
  isActive: boolean;
  isOriginal: boolean;
  brand: {
    id: string;
    name: string;
    slug: string;
    country: string;
  };
  category: {
    id: string;
    slug: string;
    name: Record<string, string>;
  };
  images: Array<{ id: string; url: string; isMain: boolean }>;
  sizes: Array<{ id: string; name: string; stock: number }>;
  translations: {
    ru: ProductTranslation;
    en: ProductTranslation;
    uz: ProductTranslation;
  };
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  size: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED_FROM_UK'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: 'CASH_ON_DELIVERY' | 'PAYME' | 'CLICK' | 'CARD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}
