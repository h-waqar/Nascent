# Roadmap: Nascent Luxury Perfumery

## Overview

Nascent delivers an end-to-end luxury e-commerce experience from sensory scent exploration to secure checkout with localized Pakistani payment rails and an administrative fulfillment suite.

## Milestones

- ✅ **v1.0 Core Luxury Storefront & Admin** - Phases 1–6, 9 (Completed)
- ✅ **v1.1 Quality, Build & Security Polish** - Phases 11–12 (Completed)
- 📋 **v2.0 Growth & Catalog Expansion** - Phases 13–15 (Planned)

## Phases

### ✅ v1.0 Core Luxury Storefront & Admin (Shipped)

#### Phase 1: Foundation & Authentication
**Goal**: Initialize Next.js 16, Clerk auth, Mongoose connection caching, Cloudinary, and Vitest test suite.
**Plans**: 3 plans
- [x] 01-01: Clerk Auth & DB connection caching
- [x] 01-02: Mongoose schemas for Product, Order, Category, Settings
- [x] 01-03: CONTRACT.md architecture specification

#### Phase 2: Core Storefront Experience
**Goal**: Build responsive navigation, collection filters, Olfactory profile breakdown, and Zustand cart store.
**Plans**: 2 plans
- [x] 02-01: Navigation, Collections, and Product Detail pages
- [x] 02-02: Olfactory notes architecture & live DB storefront wiring

#### Phase 3: Checkout & WhatsApp Integration
**Goal**: Develop checkout flow supporting Cash on Delivery, Bank Transfer, and automated WhatsApp order messages.
**Plans**: 2 plans
- [x] 03-01: Multi-step checkout form & shipping address validation
- [x] 03-02: Order confirmation & WhatsApp deep-link generation

#### Phase 4: Admin Dashboard & Control Plane
**Goal**: Create protected admin shell, statistics cards, and order/product/settings management APIs.
**Plans**: 3 plans
- [x] 04-01: Admin layout, sidebar, and requireAdmin security guard
- [x] 04-02: Admin product & category CRUD APIs
- [x] 04-03: Admin order status tracking and singleton settings store

#### Phase 5: Polishing, PKR Migration & Security Hardening
**Goal**: Convert storefront to Pakistani Rupee (PKR), implement printable invoices, and patch order creation security.
**Plans**: 3 plans
- [x] 05-01: PKR currency migration with `formatPrice()`
- [x] 05-02: Admin ProductForm & Image upload components
- [x] 05-03: Code review remediation (CR-01 price verify, CR-02 atomic stock decrement, CR-03 payment flags)

#### Phase 6: Hero Media & Visual Atmosphere
**Goal**: Ambient luxury background video component on homepage.
**Plans**: 1 plan
- [x] 06-01: Video hero integration & asset caching

#### Phase 9: Native Review Curation & Social Proof
**Goal**: Customer star ratings, verified purchase reviews, admin moderation, and Bento showcase.
**Plans**: 2 plans
- [x] 09-01: Review data model, submission API, and admin moderation panel
- [x] 09-02: Homepage Bento review showcase & product review list

---

### ✅ v1.1 Quality, Build & Security Polish (Completed)

#### Phase 11: Production Build & Dependency Hardening
**Goal**: Ensure clean Next.js builds on all environments and patch npm audit vulnerabilities.
**Depends on**: Phase 9
**Success Criteria**:
  1. `npm run build` succeeds without lightningcss binary errors
  2. Zero critical/high npm audit vulnerabilities
**Plans**: 2 plans
- [x] 11-01: Build toolchain and native module compatibility
- [x] 11-02: Dependency vulnerability updates

#### Phase 12: React Compiler & Component Optimization
**Goal**: Refactor hooks to resolve ESLint render-time ref access and cascade warnings.
**Depends on**: Phase 11
**Success Criteria**:
  1. ESLint passes with 0 errors on `src`
  2. `useScrollReveal` performs smoothly without render-time ref reads
**Plans**: 1 plan
- [x] 12-01: Scroll reveal & Nav component refactor

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|---|---|---|---|---|
| 1. Foundation & Auth | v1.0 | 3/3 | Complete | 2026-05-10 |
| 2. Core Storefront | v1.0 | 2/2 | Complete | 2026-05-11 |
| 3. Checkout & WhatsApp | v1.0 | 2/2 | Complete | 2026-05-11 |
| 4. Admin Dashboard | v1.0 | 3/3 | Complete | 2026-05-12 |
| 5. Polish & PKR Migration | v1.0 | 3/3 | Complete | 2026-05-16 |
| 6. Hero Media | v1.0 | 1/1 | Complete | 2026-05-20 |
| 9. Native Review Showcase | v1.0 | 2/2 | Complete | 2026-06-02 |
| 11. Build & Dependency Hardening | v1.1 | 2/2 | Complete | 2026-08-26 |
| 12. Component & Hook Polish | v1.1 | 1/1 | Complete | 2026-08-26 |
