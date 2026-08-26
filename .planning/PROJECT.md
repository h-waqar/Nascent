# Nascent — Luxury Perfumery E-Commerce Platform

## What This Is

Nascent is an artisanal luxury perfumery e-commerce platform crafted for fragrance connoisseurs in Pakistan. It combines bespoke olfactory profiling, an interactive Scent Finder, seamless shopping with Pakistani Rupee (PKR) pricing, dual payment methods (Cash on Delivery & Direct Bank Transfer with WhatsApp confirmation), and an integrated admin curation dashboard.

## Core Value

Deliver an evocative, uncompromising luxury shopping experience that makes discovering, evaluating, and purchasing bespoke fragrances effortless and transparent.

## Business Context

- **Customer**: Fragrance enthusiasts, collectors, and gift buyers in Pakistan seeking niche, high-concentration Extrait de Parfum.
- **Revenue model**: Direct-to-consumer (D2C) perfume sales, discovery sets, and bespoke scent matching.
- **Success metric**: Smooth checkout conversion rate, zero stock overselling, and verified customer review engagement.

## Requirements

### Validated

- ✓ **01-01 Foundation Infrastructure**: Clerk authentication, Mongoose connection caching, Cloudinary media client, Vitest test harness.
- ✓ **02-01 Core Storefront**: Curated collections, Olfactory profile breakdowns (top, heart, base notes), interactive cart drawer.
- ✓ **03-01 Checkout & Order Flow**: Address collection, Cash on Delivery, Bank Transfer, dynamic WhatsApp order link generation.
- ✓ **04-01 Admin Dashboard & APIs**: Protected admin shell (`requireAdmin`), stats metrics, order management, singleton settings store.
- ✓ **05-01 Polishing & PKR Currency**: `formatPrice()` with PKR (`Rs.`), printable invoices, admin product CRUD, security patches for order stock decrement.
- ✓ **06-01 Hero Background Video**: High-definition ambient background video element on the homepage.
- ✓ **09-01 Native Review Curation**: Verified review submission, 5-star rating aggregates, admin moderation panel, Bento showcase on homepage.
- ✓ **Scent Finder Engine**: Interactive multi-question fragrance quiz matching users to scent profiles.

### Active

- [ ] **Build & Dependency Optimization**: Resolve Linux `lightningcss` build dependency and patch npm audit vulnerabilities.
- [ ] **React Compiler & Hook Cleanups**: Refactor `useScrollReveal` and `Nav.tsx` to eliminate ref-in-render and cascade render warnings.
- [ ] **SEO & Metadata Enhancement**: OpenGraph tags, structured schema JSON-LD for products, and sitemap generation.

### Out of Scope

- Multi-currency switching (USD/GBP/EUR) — Project is focused specifically on the Pakistani market in PKR (`Rs.`).
- Third-party international payment gateways (Stripe/PayPal) — Restricted to Cash on Delivery (COD) and Direct Bank Transfer per local market dynamics.
- Automated carrier API shipping dispatch — Orders are coordinated and fulfilled directly via admin WhatsApp communication.

## Context

- **Framework**: Next.js 16 (App Router, Turbopack) with React 19.
- **Styling**: Tailwind CSS v4, Lucide React icons, and custom luxury typography (Inter & Cormorant Garamond).
- **Database**: MongoDB Atlas with Mongoose ODM models.
- **Authentication**: Clerk Next.js App Router middleware & server-side token validation.

## Constraints

- **Currency**: Pakistani Rupee (`PKR` / `Rs.`), `en-PK` locale format without decimal cents.
- **Security**: Strict server-side validation on prices, inventory decrement, and payment method toggles.
- **Admin Protection**: Route handlers under `/api/admin/*` and pages under `/admin/*` must enforce `requireAdmin`.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **D-01: PKR Currency Migration** | Localized customer trust and eliminates exchange rate confusion | ✓ Good |
| **D-02: Server-side Price Lookup** | Prevents client-side price tampering vulnerabilities on `/api/orders` | ✓ Good |
| **D-03: Atomic Inventory Decrement** | Prevents race conditions and overselling of limited perfume stock | ✓ Good |
| **D-04: WhatsApp Direct Confirmation** | Standard communication and receipt verification channel in Pakistan | ✓ Good |
| **D-05: Singleton Settings Store** | Dynamic admin control over payment toggles, banking details, and shipping fees | ✓ Good |
| **D-06: Native Review Moderation** | Ensures verified, high-quality social proof without third-party SaaS fees | ✓ Good |
| **D-17: Canonical Contract Location** | Single shared contract at `.planning/phases/01-foundation-auth/01-03-CONTRACT.md` for full agent alignment | ✓ Good |

---
*Last updated: 2026-08-26 after Milestone v1.0 completion & planning recovery*
