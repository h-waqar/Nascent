# API Contract: Nascent

**Version:** 1.0
**Status:** DRAFT

This document serves as the "Source of Truth" for API boundaries between Gemini (Frontend) and Claude (Backend).

## Core Schemas (Zod/TypeScript)

### Product
```typescript
{
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  scentNotes: string[];
  categoryId: string;
}
```

### Category
```typescript
{
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}
```

## Endpoints

### 1. Products List
- **Endpoint:** `/api/products`
- **Method:** `GET`
- **Query Params:** `category?`, `search?`
- **Status:** PLANNED

### 2. Product Detail
- **Endpoint:** `/api/products/[slug]`
- **Method:** `GET`
- **Status:** PLANNED

### 3. Categories List
- **Endpoint:** `/api/categories`
- **Method:** `GET`
- **Status:** PLANNED
