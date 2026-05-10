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

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer";

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;            // Clerk user id
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  whatsappLink?: string;     // populated when WhatsApp link is generated (REQ §6)
  createdAt: string;         // ISO date string — frontend-safe (no Date object)
  updatedAt: string;
}
