# CONTRACT.md — Nascent Architecture & Interface Specifications

> **Canonical System Contract (Locked Decision D-17)**
> This document specifies all data models, API endpoints, authentication boundaries, and UI standards across the Nascent platform.

---

## 1. Domain Data Models (Mongoose & TypeScript)

### 1.1 Product (`src/models/Product.ts`, `src/types/models.ts`)
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;              // In PKR (Rs.)
  stock: number;              // Non-negative integer
  images: string[];           // Cloudinary image URLs
  scentNotes: string[];
  topNote?: string;
  heartNote?: string;
  baseNote?: string;
  intensity?: "Subtle" | "Light" | "Moderate" | "Strong" | "Intense";
  volume?: string;            // e.g. "50ml Extrait de Parfum"
  categoryId?: string;
  isFeatured: boolean;
  isHidden?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 1.2 Order (`src/models/Order.ts`)
```typescript
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type PaymentMethod = "cod" | "bank_transfer";

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  whatsappLink?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 1.3 Review (`src/models/Review.ts`)
```typescript
type ReviewStatus = "pending" | "approved" | "rejected";

interface Review {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number;             // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  isFeaturedHomepage: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}
```

### 1.4 Settings (`src/models/Settings.ts`)
```typescript
interface Settings {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  whatsappNumber: string;
  shippingCost: number;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  updatedAt: string;
}
```

---

## 2. API Specifications

### Public Endpoints
- `GET /api/products`: List visible products with optional category filtering.
- `GET /api/products/[slug]`: Get single product by slug.
- `GET /api/products/[slug]/reviews`: Get approved reviews for a specific product.
- `GET /api/reviews/homepage`: Curated approved reviews for homepage showcase.
- `POST /api/products/[slug]/reviews`: Submit a customer product review (rate-limited).
- `GET /api/settings`: Read public payment flags and contact info.
- `POST /api/orders`: Secure order creation (validates price against DB, atomically decrements stock).
- `GET /api/orders`: List orders placed by the authenticated user.

### Admin Endpoints (`requireAdmin` Enforced)
- `GET /api/admin/stats`: KPI metrics (revenue, orders count, status breakdown, low stock alerts).
- `GET /api/admin/products`, `POST /api/admin/products`: Product listing & creation.
- `GET /api/admin/products/[id]`, `PUT /api/admin/products/[id]`, `DELETE /api/admin/products/[id]`: Product CRUD.
- `GET /api/admin/orders`: Filtered orders list with status chips and pagination.
- `GET /api/admin/orders/[id]`, `PUT /api/admin/orders/[id]`: Order detail & status transitions.
- `GET /api/admin/reviews`, `PUT /api/admin/reviews/[id]`: Review moderation & feature toggles.
- `GET /api/admin/settings`, `PUT /api/admin/settings`: Singleton store configuration.
- `POST /api/admin/upload`: Cloudinary asset upload.

---

## 3. Currency & Formatting Guidelines

- All store pricing must be displayed via `formatPrice(amount)` from `src/lib/currency.ts`.
- Format: `Rs. XX,XXX` (en-PK locale, no decimal cents).
- Order reference IDs are formatted via `orderRef(id)` as `#NSC-XXXXXX` (last 6 characters of ObjectId in uppercase).

---

## 4. Security & Business Logic Invariants

1. **Price Integrity**: Order endpoints MUST NOT trust client-supplied prices. Canonical pricing is fetched directly from `ProductModel`.
2. **Stock Protection**: Stock is decremented atomically with `{ stock: { $gte: quantity } }`. If an order fails mid-creation, inventory is rolled back.
3. **Payment Method Verification**: Orders must verify that `paymentMethod` is currently enabled in `SettingsModel`.
4. **Admin Guard**: All admin API endpoints and pages enforce `requireAdmin()` verifying the Clerk session and admin role.
