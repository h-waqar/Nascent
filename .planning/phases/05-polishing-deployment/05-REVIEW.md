---
phase: 05-polishing-deployment
reviewed: 2026-05-15T10:00:00Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - app/src/app/(admin)/admin/orders/[id]/page.tsx
  - app/src/app/(admin)/admin/orders/page.tsx
  - app/src/app/(admin)/admin/products/[id]/edit/page.tsx
  - app/src/app/(admin)/admin/products/new/page.tsx
  - app/src/app/(admin)/admin/products/page.tsx
  - app/src/app/(admin)/admin/settings/page.tsx
  - app/src/app/(store)/checkout/page.tsx
  - app/src/app/(store)/collections/page.tsx
  - app/src/app/(store)/orders/[id]/confirmation/page.tsx
  - app/src/app/(store)/orders/[id]/invoice/page.tsx
  - app/src/app/(store)/products/[slug]/page.tsx
  - app/src/app/api/admin/orders/[id]/route.ts
  - app/src/app/api/admin/orders/route.ts
  - app/src/app/api/admin/products/[id]/route.ts
  - app/src/app/api/admin/products/route.ts
  - app/src/app/api/admin/settings/route.ts
  - app/src/app/api/settings/route.ts
  - app/src/components/admin/OrderStatusManager.tsx
  - app/src/components/admin/ProductForm.tsx
  - app/src/components/admin/ProductImageUpload.tsx
  - app/src/lib/currency.ts
  - app/src/lib/schemas.ts
  - app/src/lib/whatsapp.ts
  - app/src/models/Settings.ts
  - app/src/types/models.ts
findings:
  critical: 5
  warning: 7
  info: 2
  total: 14
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-15T10:00:00Z
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

Reviewed 23 source files covering admin pages, store pages, API routes, components, and library modules introduced or modified in Phase 5. The order creation API (`/api/orders`) contains three independently exploitable security/correctness defects that are blockers before any production deployment: client-supplied prices are accepted without cross-referencing the database, stock is never checked or decremented, and payment-method enabledness is never enforced server-side. Two additional blockers exist in the admin product form (volume data corruption on round-trip and silent field-clearing on edit). Warnings cover a hardcoded UK country code in a Pakistan-focused store, a missing "Subtle" intensity option causing data loss, stale object URLs, an opaque WhatsApp fallback number, inconsistent order-reference lengths, and unauthenticated exposure of bank details.

---

## Critical Issues

### CR-01: Client-supplied item prices accepted without server-side verification

**File:** `app/src/app/api/orders/route.ts:32`
**Issue:** The order creation endpoint computes `subtotal` from `items[].price` values that came directly from the request body. There is no lookup against `ProductModel` to verify the actual price. A malicious user can craft a POST with `price: 0.01` for a Rs. 50,000 product and the order is accepted at that price. This is a textbook price-manipulation vulnerability.
**Fix:**
```typescript
// After validating items exist, fetch canonical prices from DB:
const productIds = items.map((i) => i.productId);
await connectToDatabase();
const dbProducts = await ProductModel.find({ _id: { $in: productIds } })
  .select("_id price")
  .lean();
const priceMap = new Map(dbProducts.map((p) => [p._id.toString(), p.price]));

// Replace client prices with DB prices before computing subtotal:
const verifiedItems = items.map((item) => {
  const dbPrice = priceMap.get(item.productId);
  if (dbPrice === undefined) throw new Error(`Product not found: ${item.productId}`);
  return { ...item, price: dbPrice };
});
const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
```

---

### CR-02: No stock validation or decrement on order creation

**File:** `app/src/app/api/orders/route.ts:36-46`
**Issue:** `OrderModel.create` runs with no check against `ProductModel.stock`. Users can place orders for out-of-stock products, and inventory is never decremented. The low-stock dashboard at `/api/admin/stats` reflects only product records — since stock never moves, those counts are permanently stale. Concurrent orders for the same last-unit item will all succeed.
**Fix:**
```typescript
// In a transaction or with atomic findOneAndUpdate:
for (const item of verifiedItems) {
  const updated = await ProductModel.findOneAndUpdate(
    { _id: item.productId, stock: { $gte: item.quantity } },
    { $inc: { stock: -item.quantity } },
    { new: true }
  );
  if (!updated) {
    return NextResponse.json(
      { error: `Insufficient stock for: ${item.name}` },
      { status: 409 }
    );
  }
}
```

---

### CR-03: Payment method not validated against admin-configured settings

**File:** `app/src/app/api/orders/route.ts:27-44`
**Issue:** The admin can disable COD or bank transfer via `/api/admin/settings`, but `POST /api/orders` never reads those settings. The store UI respects the toggles; the API does not. Any user who bypasses the UI (curl, browser devtools) can still submit orders using a disabled payment method. Additionally, `paymentMethod` is never validated against the `PaymentMethod` enum — any arbitrary string passes the check at line 28.
**Fix:**
```typescript
// Validate enum first:
if (!["cod", "bank_transfer"].includes(paymentMethod)) {
  return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
}

// Then enforce admin settings:
const settings = await SettingsModel.findOne({}).lean();
if (paymentMethod === "cod" && settings && !settings.codEnabled) {
  return NextResponse.json({ error: "Cash on delivery is not available" }, { status: 400 });
}
if (paymentMethod === "bank_transfer" && settings && !settings.bankTransferEnabled) {
  return NextResponse.json({ error: "Bank transfer is not available" }, { status: 400 });
}
```

---

### CR-04: Volume field corrupts data on round-trip edit

**File:** `app/src/components/admin/ProductForm.tsx:49, 123, 263`
**Issue:** The `Product` type declares `volume` as a freeform string (e.g., `"50ml Extrait de Parfum"`). The form state stores it as-is from `p?.volume ?? ""`. The display strips a trailing `ml` suffix with `.replace(/ml$/, "")` (line 263), which only matches exactly at the end. On save, the form appends `ml` unconditionally: `` `${form.volume}ml` `` (line 123). Round-trip: `"50ml Extrait de Parfum"` → displayed as `"50ml Extrait de Parfu"` (stripping trailing `m`) → saved as `"50ml Extrait de Parfuml"`. Every edit corrupts the value further.
**Fix:** Either commit to a pure-numeric form field and strip/add the `ml` suffix consistently, or treat volume as freeform and remove the suffix manipulation entirely:
```typescript
// Option A — pure numeric (breaking change to existing data, needs migration):
// Store only the number; always display as `${value}ml`; schema stores `volume` as number.

// Option B — freeform (zero migration cost):
// In fromProduct: volume: p?.volume ?? "",
// In the input: type="text", value={form.volume}  (no replace)
// In handleSubmit: if (form.volume.trim()) payload.volume = form.volume.trim();
// (Remove the `ml` concatenation entirely)
```

---

### CR-05: Optional product fields cannot be cleared in edit mode

**File:** `app/src/components/admin/ProductForm.tsx:118-123`
**Issue:** The submit handler only adds optional fields to the payload when they are non-empty. The API uses `{ $set: parsed.data }` and `UpdateProductSchema` is a `partial()`. Consequence: if an admin clears `topNote`, `heartNote`, `baseNote`, `intensity`, `volume`, or `categoryId` in the UI and clicks "Update Product," the PUT request omits those keys, and `$set` with absent keys leaves the existing DB values unchanged. The fields appear cleared in the form but the database retains the old values. The UI shows stale-then-refreshed-to-old data.
**Fix:**
```typescript
// Explicitly send null/empty for cleared optional fields so $set removes them:
const payload: Record<string, unknown> = {
  name: form.name.trim(),
  slug: form.slug.trim() || generateSlug(form.name),
  description: form.description.trim(),
  price: Number(form.price),
  stock: Number(form.stock),
  images: imageUrl ? [imageUrl] : [],
  scentNotes: initialProduct?.scentNotes ?? [],
  isFeatured: form.isFeatured,
  categoryId: form.categoryId || null,
  topNote: form.topNote.trim() || null,
  heartNote: form.heartNote.trim() || null,
  baseNote: form.baseNote.trim() || null,
  intensity: form.intensity || null,
  volume: form.volume.trim() ? `${form.volume.trim()}ml` : null,
};
// The UpdateProductSchema must accept null values, or use $unset in the API for null fields.
```

---

## Warnings

### WR-01: "Subtle" intensity option missing from ProductForm

**File:** `app/src/components/admin/ProductForm.tsx:19, 48`
**Issue:** `INTENSITY_OPTIONS` is `["Light", "Moderate", "Strong", "Intense"]`. The backend schema (`lib/schemas.ts:19`) and model type (`types/models.ts:19`) both accept `"Subtle"`. `fromProduct` at line 48 maps any intensity value that is not in `INTENSITY_OPTIONS` (including `"Subtle"`) to `""`. Editing a product whose intensity is `"Subtle"` silently resets it to no intensity on save.
**Fix:**
```typescript
const INTENSITY_OPTIONS = ["Subtle", "Light", "Moderate", "Strong", "Intense"] as const;
```

---

### WR-02: Hardcoded country "GB" in a Pakistan-focused store

**File:** `app/src/app/(store)/checkout/page.tsx:94`
**Issue:** `country: "GB"` is hardcoded in the shipping address object. The project's recent PKR currency migration explicitly targets Pakistani customers. Every order in the database records Great Britain as the country, admin views show "GB" on the invoice, and any future carrier integration or tax logic will receive incorrect data. The `state` field collected from the form (line 196) is also silently discarded — never included in `shippingAddress`.
**Fix:**
```typescript
const shippingAddress: ShippingAddress = {
  fullName: `${form.firstName} ${form.lastName}`.trim(),
  line1: form.line1,
  line2: form.line2 || undefined,
  city: form.city,
  postalCode: form.postalCode,
  country: "PK",           // Pakistan
  phone: form.phone,
};
```
Also rename or remove the `state` form field since it is not persisted.

---

### WR-03: Object URL created in ProductImageUpload is never revoked

**File:** `app/src/components/admin/ProductImageUpload.tsx:37-38`
**Issue:** `URL.createObjectURL(file)` creates a Blob URL that holds a reference to the file's memory. It is never released with `URL.revokeObjectURL`. On a long-lived admin session with multiple image previews, this leaks browser memory until the tab is closed.
**Fix:**
```typescript
// In handleChange, revoke the previous preview if it was an object URL:
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setError(null);
  // Revoke previous object URL if present and not the existingUrl
  if (previewUrl && previewUrl !== (existingUrl ?? null) && previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
  // ... rest of handler
  const objectUrl = URL.createObjectURL(file);
  setPreviewUrl(objectUrl);
  onFileChange(file);
}
// Also add a useEffect cleanup to revoke on unmount.
```

---

### WR-04: WhatsApp fallback number is a real-looking UK number

**File:** `app/src/lib/whatsapp.ts:4`
**Issue:** `WHATSAPP_NUMBER` defaults to `"447700000000"` when `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset. This is a valid `wa.me` target format — if the environment variable is absent in production, every generated WhatsApp link silently routes real customer messages to that number. There is no error or warning thrown. The safe default is an empty string with a guard.
**Fix:**
```typescript
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
if (!WHATSAPP_NUMBER && process.env.NODE_ENV === "production") {
  console.error("NEXT_PUBLIC_WHATSAPP_NUMBER is not set");
}

export function generateWhatsAppLink(order: Order): string {
  if (!WHATSAPP_NUMBER) return "#";   // or throw in server context
  // ... rest unchanged
}
```

---

### WR-05: Order reference suffix length inconsistency

**File:** `app/src/lib/whatsapp.ts:13`, `app/src/app/(store)/orders/[id]/confirmation/page.tsx:70`, `app/src/app/(admin)/admin/orders/page.tsx:106`, `app/src/app/(admin)/admin/orders/[id]/page.tsx:29`
**Issue:** The WhatsApp message uses `.slice(-6)` for the order reference. The confirmation page and invoice use `.slice(-4)`. The admin orders list uses `.slice(-4)`. This means a customer receives a WhatsApp with reference `#ABCDEF` but the admin sees `#CDEF` — they cannot match orders without looking up the full ID. There is also a collision risk at `.slice(-4)` (only 65,536 unique values with hex ObjectId tails).
**Fix:** Pick one length, preferably `-6`, and use it consistently across all files. Extract it into a shared utility:
```typescript
// lib/orderRef.ts
export function orderRef(id: string): string {
  return `#NSC-${id.slice(-6).toUpperCase()}`;
}
```

---

### WR-06: Public `/api/settings` exposes bank account details unauthenticated

**File:** `app/src/app/api/settings/route.ts:14-37`
**Issue:** The endpoint returns `bankName`, `accountName`, `accountNumber`, and `iban` to any unauthenticated request. The intent (supply checkout with bank details) is valid, but exposing `accountNumber` and `iban` without any rate limiting or authentication enables automated scraping of sensitive financial identifiers. For a public-facing API this is a design decision, but it should be flagged.
**Fix:** At minimum, implement response caching to reduce exposure surface. If possible, limit the response for unauthenticated callers to only `codEnabled`/`bankTransferEnabled`, and require an active session (any authenticated user) to retrieve the full bank details — or only transmit them once the user has begun an order session.

---

### WR-07: "Saved" banner on admin settings page never re-renders

**File:** `app/src/app/(admin)/admin/settings/page.tsx:208`
**Issue:** `{savedAt && Date.now() - savedAt < 3000 && <span>Saved</span>}` evaluates `Date.now()` at render time. Because React does not schedule re-renders on a timer, this element will only appear immediately after `setSavedAt(Date.now())` triggers a re-render and will disappear on the very next render (user moves mouse, filter change, etc.). In practice, the banner is invisible or flickers for a single frame.
**Fix:**
```typescript
const [showSaved, setShowSaved] = useState(false);

// In handleSaveBank, after success:
setShowSaved(true);
setTimeout(() => setShowSaved(false), 3000);

// In JSX:
{showSaved && <span className="...">Saved</span>}
```

---

## Info

### IN-01: Collections page and product detail page use static dummy data

**File:** `app/src/app/(store)/collections/page.tsx:7`, `app/src/app/(store)/products/[slug]/page.tsx:6`
**Issue:** Both pages import from `@/components/dummy-data`. Admin-created products (stored in MongoDB via `/api/admin/products`) are never visible to customers. This is likely an intentional stub for Phase 5, but it means the admin's product management is completely disconnected from the customer-facing storefront.
**Fix:** Replace the static import with a fetch from `/api/products` (public read-only endpoint) in each page.

---

### IN-02: Shipping fee is hardcoded in two independent locations

**File:** `app/src/app/api/orders/route.ts:33`, `app/src/app/(store)/checkout/page.tsx:62`
**Issue:** `const shipping = 5` appears in both the API and the frontend. They must stay in sync manually. Post-PKR migration, Rs. 5 shipping is almost certainly incorrect for a perfume business (likely Rs. 200–500). Neither value is sourced from settings.
**Fix:** Move the shipping fee to a named constant in a shared location (e.g., `lib/constants.ts`) and expose it via the settings API if it needs to be admin-configurable.

---

_Reviewed: 2026-05-15T10:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
