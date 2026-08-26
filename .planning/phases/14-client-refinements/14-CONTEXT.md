# Phase 14 Context: Client Refinements & Bug Fixes

## Domain
Customer experience polish, unauthenticated star ratings, comprehensive catalog sorting, brand-aligned royalty-free imagery, 40% concentration update, and mobile catalog rendering fixes.

## Locked Requirements & Decisions

### 1. Ratings vs Reviews Separation
- **Star Ratings (Guest Allowed)**:
  - Users can submit 1-5 star ratings without logging in.
  - Visitors are tracked/fingerprinted via session ID / IP hash to prevent duplicate submissions.
  - Rating recalculation updates aggregate product score and rating count in real-time.
- **Written Reviews (Clerk Auth Required)**:
  - Full reviews (title, body, avatar, name) remain authenticated via Clerk and subject to moderation if needed.
- **Display**:
  - Stars shown on Single Product Page (`/products/[slug]`) with click-to-scroll to `#reviews`.
  - Stars shown on Product Cards (`ProductCard.tsx`) across collections and home curated grid.

### 2. Catalog Sorting (`/collections`)
- Luxury dropdown select containing:
  - `featured`: Featured / Default
  - `popular`: Popularity (Highest rating / rating count)
  - `price_asc`: Price: Low to High
  - `price_desc`: Price: High to Low
  - `name_asc`: Alphabetical: A → Z
  - `name_desc`: Alphabetical: Z → A
  - `newest`: Newest First
  - `oldest`: Oldest First

### 3. Media & Assets
- Generate custom, royalty-free monochrome luxury perfume imagery with zero third-party logos or branding:
  - `landing_scent_architecture.png`
  - `landing_scent_anatomy.png`
  - `about_hero_banner.png`
  - `hero_video_poster.png`
- Replace hardcoded Unsplash image links in `HeroSection`, `ScentArchitectureSection`, `ScentAnatomySection`, and `AboutPage`.

### 4. About Page ("The House")
- Change 30% concentration references to **40% concentration of pure scent oils** and **40% Scent Oils** in `src/app/(store)/about/page.tsx`.
- Update hero image to the new brutalist architectural banner.

### 5. Hero Video Flicker Fix
- Replace third-party unsplash poster in `HeroSection.tsx` with seamless dark poster image and loaded event transition.

### 6. Mobile Collections Catalog Loading Fix
- Remove blocking scroll reveal `opacity-0` threshold on product catalog.
- Add mobile collapsible filter bar so products render immediately above the fold on mobile viewports.
