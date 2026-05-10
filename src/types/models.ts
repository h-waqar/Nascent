/**
 * Nascent Core Entity Interfaces (D-14)
 * These interfaces represent the source of truth for the application's data models.
 * Defined contract-first to ensure alignment between Gemini (Frontend) and Claude (Backend).
 */

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  scentNotes: string[];
  categoryId: string;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'whatsapp' | 'bank_transfer' | 'cod';
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}
