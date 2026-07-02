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
  scentNotes: string[];        // e.g. ["Floral", "Fresh"] — shown in collections grid
  categoryId: string;
  hidden?: boolean;
  isFeatured?: boolean;
  collection?: string;          // e.g. "NOCTURNAL COLLECTION // 004"
  intensity?: "Subtle" | "Light" | "Moderate" | "Strong" | "Intense";
  volume?: string;              // e.g. "50ml Extrait de Parfum"
  topNote?: string;
  heartNote?: string;
  baseNote?: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  userId: string;
  authorName: string;
  authorImageUrl?: string;
  rating: number;
  title?: string;
  body: string;
  status: ReviewStatus;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  isFeatured: boolean;
  featuredRank?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type PublicReview = Pick<
  Review,
  | "id"
  | "productId"
  | "productSlug"
  | "productName"
  | "authorName"
  | "authorImageUrl"
  | "rating"
  | "title"
  | "body"
  | "isFeatured"
  | "featuredRank"
  | "createdAt"
  | "updatedAt"
>;

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "refunded"
  | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer";

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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

export interface Settings {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  whatsappNumber: string;
  shippingCost: number;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  updatedAt: string; // ISO date string
}
