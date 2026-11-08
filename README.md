# Multi-Shop E-Commerce Management System

A production-quality multi-tenant e-commerce platform engineered with a **centralized shared product catalog** where multiple shop owners sell from a unified global product repository while maintaining independent selling prices, descriptions, and media.

Built with **Laravel 13**, **PHP 8.4 / 8.5**, **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **MySQL 8+**.

---

## 1. Core Business Architecture

The fundamental requirement of this platform is the separation of **Global Catalog Products** and **Shop Product Listings**:

```
+-------------------------------------------------------------------------------+
|                       CENTRALIZED SHARED PRODUCT CATALOG                       |
|                   (Stored in `products` - Global Catalog)                     |
|                                                                               |
|  Product A: Titanium Smart Watch (SKU-WCH-SMT02)                              |
|  Created by: Administrator or Shop Owner                                       |
+-------------------------------------------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
+----------------------------------+     +----------------------------------+
|           SHOP LISTING           |     |           SHOP LISTING           |
|      (Shop 1: Fashion House)     |     |       (Shop 2: Tech Store)       |
|                                  |     |                                  |
| • Selling Price: ৳12,500.00      |     | • Selling Price: ৳10,990.00      |
| • Custom Promo: "Luxury Edition" |     | • Custom Promo: "Bundle Edition" |
| • Status: Active                 |     | • Status: Active                 |
+----------------------------------+     +----------------------------------+
```

### Key Business Rules
1. **Never Duplicate Products**: When a merchant adds a catalog item to their shop, the global product record is never cloned. The assignment is stored in the `shop_products` pivot table.
2. **Global Discovery**: Products created by any shop owner are automatically stored in the shared catalog, immediately becoming available for other shop owners to browse and list.
3. **Graceful Fallbacks**: If a shop does not supply a custom description or thumbnail, the storefront seamlessly falls back to the master product's information.
4. **Strict Customer Isolation**: Storefront visitors only see active products explicitly assigned to that shop. Unassigned or inactive listings are strictly filtered on the backend query layer.
5. **Multi-Shop Pricing**: Different merchants independently set their own selling prices in Bangladeshi Taka (৳).

---

## 2. Technology Stack

- **Backend**:
  - **Framework**: Laravel 13 (`v13.40.0`)
  - **Language**: PHP 8.4 / 8.5 (compatible with `^8.3`)
  - **Authentication**: Laravel Sanctum (`v4.3.3`) Bearer Tokens
  - **Database**: MySQL 8+ (relational, foreign key constraints, composite indexes)
  - **Architecture**: Service Layer, Form Requests, API Resources, Policies, and Role Middleware
  - **Testing**: PHPUnit 12 with 27 automated unit and feature tests
- **Frontend**:
  - **Framework**: Next.js 15 / 16 (App Router, React 19)
  - **Language**: TypeScript (strict mode enabled)
  - **Styling**: Tailwind CSS with custom SaaS design tokens
  - **State & Data Fetching**: TanStack React Query v5
  - **HTTP Client**: Centralized Axios client with automatic Bearer token injection
  - **Icons**: Lucide React
  - **UI Primitives**: Custom accessible modals, stat cards, badges, and responsive tables

---

## 3. Repository Structure

```
.
├── README.md                           # Master project documentation
├── backend/                            # Laravel 13 REST API Application
│   ├── app/
│   │   ├── Enums/                      # UserRole, ShopStatus, ShopProductStatus
│   │   ├── Http/
│   │   │   ├── Controllers/Api/        # Auth, Admin, Owner, Storefront, Upload
│   │   │   ├── Middleware/             # EnsureUserHasRole
│   │   │   ├── Requests/               # Strict Form Request validation classes
│   │   │   └── Resources/              # API Resource transformers with fallback logic
│   │   ├── Models/                     # User, Shop, Product, ShopProduct
│   │   ├── Policies/                   # ShopPolicy, ProductPolicy, ShopProductPolicy
│   │   └── Services/                   # ShopService, ProductService, ShopProductService, ImageUploadService
│   ├── config/                         # cors.php, sanctum.php, filesystems.php
│   ├── database/
│   │   ├── migrations/                 # 7 migrations (users, shops, products, shop_products, tokens)
│   │   └── seeders/DatabaseSeeder.php  # Realistic demo seeder (Admin, 2 Owners, 2 Shops, cross-listed items)
│   ├── routes/api.php                  # 39 versioned REST API routes under /api/v1/
│   └── tests/Feature/                  # Automated feature test suites
└── frontend/                           # Next.js 15 App Router Frontend Application
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/login/           # One-click demo credentials login page
    │   │   ├── admin/                  # Admin Dashboard, Shops, Catalog, Shop Owners
    │   │   ├── owner/                  # Owner Dashboard, Shared Catalog, My Inventory, Settings
    │   │   ├── store/[shopSlug]/       # Public customer storefront with fallback resolution
    │   │   └── layout.tsx & page.tsx   # Platform showcase landing page
    │   ├── components/                 # Modals, Sidebar, StatCards, UI primitives
    │   ├── context/AuthContext.tsx     # Session management and role-based route protection
    │   ├── lib/api.ts                  # Centralized Axios client with interceptors
    │   └── types/index.ts              # Strict TypeScript interfaces matching backend DTOs
```

---

## 4. Fresh Installation & Setup Guide

Follow these steps to set up and run the entire application from a fresh clone.

### Prerequisites
- **PHP**: `^8.3` (PHP 8.4 or 8.5 recommended)
- **Composer**: `^2.5`
- **Node.js**: `v20+` (v22 recommended) and `npm`
- **MySQL**: 8.0+ running on `127.0.0.1:3306`

---

### Step 1: Database Setup
Create the MySQL database:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS multishop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

### Step 2: Backend Setup (Laravel 13)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Configure environment file:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Verify database credentials in `backend/.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=multishop_db
   DB_USERNAME=root
   DB_PASSWORD=
   FILESYSTEM_DISK=public
   ```

5. Run database migrations and seed realistic demo data:
   ```bash
   php artisan migrate:fresh --seed
   ```

6. Link public file storage:
   ```bash
   php artisan storage:link
   ```

7. Start the backend development server:
   ```bash
   php artisan serve --port=8000
   ```
   *The API will be live at `http://localhost:8000/api/v1`.*

---

### Step 3: Frontend Setup (Next.js 15)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure environment file:
   ```bash
   cp .env.example .env.local
   ```
   *Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` is set.*

4. Build and start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be live at `http://localhost:3000`.*

---

## 5. Demo Credentials (One-Click Logins)

The application includes convenient **one-click login buttons** on the login page (`http://localhost:3000/login`) with the following pre-configured demo accounts:

| Role | Email | Password | Primary Shop |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@example.com` | `password` | *N/A (Full Platform Access)* |
| **Shop Owner 1** | `owner1@example.com` | `password` | **Fashion House** (`/store/fashion-house`) |
| **Shop Owner 2** | `owner2@example.com` | `password` | **Tech Store** (`/store/tech-store`) |

*(Demo passwords are for local evaluation and testing purposes only).*

---

## 6. Live Customer Storefronts

No authentication is required to browse customer storefronts:
- **Fashion House Storefront**: [`http://localhost:3000/store/fashion-house`](http://localhost:3000/store/fashion-house)
- **Tech Store Storefront**: [`http://localhost:3000/store/tech-store`](http://localhost:3000/store/tech-store)

### Verifying Architectural Requirements in the Storefront:
1. **Shared Product with Different Prices**:
   - `Titanium Smart Lifestyle Watch` (SKU: `SKU-WCH-SMT02`):
     - Sold in **Fashion House** for **৳12,500.00** with custom luxury description.
     - Sold in **Tech Store** for **৳10,990.00** with custom tech description.
2. **Information Fallback**:
   - `Acoustic Pro Active Noise Cancelling Headphones` (SKU: `SKU-AUD-ANC9`) in Fashion House has no custom description; it automatically falls back to the global description.
3. **Strict Visibility & Isolation**:
   - `Tactile Mechanical Keyboard 75%` is assigned only to Tech Store — it **never appears** in Fashion House.
   - `Universal Studio Desk Mat` (SKU: `SKU-CAT-SOLO01`) is in the shared catalog but unassigned to any shop — it **never appears** in any storefront.
   - `Minimalist Leather Backpack` is marked `inactive` in Fashion House — it is **automatically hidden** from customers.

---

## 7. Running Automated Tests

Run the full PHPUnit test suite covering authentication, admin management, catalog sharing, tenant isolation, and storefront visibility:

```bash
cd backend
php artisan test
```

### Test Coverage Highlights (27 Tests, 88 Assertions)
- `AuthTest`: Tests login for admin and owner, rejects invalid credentials, enforces unauthenticated and unauthorized role gating.
- `AdminManagementTest`: Tests shop creation with existing or new owner transactionally, updates, deletions, and catalog additions.
- `SharedCatalogTest`: Tests that owner-created products appear in the global catalog, prevents duplicate products when added to multiple shops, and tests cross-owner discovery.
- `ShopOwnershipAndListingTest`: Enforces strict cross-shop isolation (owners cannot access or update other shops' listings), verifies independent pricing, and confirms that removing a listing does not delete the global product.
- `CustomerStorefrontTest`: Verifies that customers only see active products assigned to that shop, validates shop-specific prices, and checks fallback resolution.

---

## 8. Complete API Endpoint Overview

### Authentication
- `POST /api/v1/auth/login` - Authenticate and retrieve Bearer token
- `POST /api/v1/auth/logout` - Revoke current token (`auth:sanctum`)
- `GET  /api/v1/auth/me` - Retrieve current user profile and owned shops (`auth:sanctum`)

### Admin Management (`role:admin`)
- `GET    /api/v1/admin/dashboard` - Platform metrics and recent telemetry
- `GET    /api/v1/admin/shops` - List shops with search and status filter
- `POST   /api/v1/admin/shops` - Create shop (supports existing or new owner)
- `GET    /api/v1/admin/shops/{id}` - View shop details and assigned products
- `PUT    /api/v1/admin/shops/{id}` - Update shop profile and status
- `DELETE /api/v1/admin/shops/{id}` - Soft-delete shop
- `GET    /api/v1/admin/products` - Shared catalog products with adoption counts
- `POST   /api/v1/admin/products` - Create global product
- `GET    /api/v1/admin/products/{id}` - View product details and adopting shops
- `PUT    /api/v1/admin/products/{id}` - Update global product details
- `DELETE /api/v1/admin/products/{id}` - Soft-delete product
- `GET    /api/v1/admin/shop-owners` - List registered merchant accounts
- `POST   /api/v1/admin/shop-owners` - Register new merchant
- `PUT    /api/v1/admin/shop-owners/{id}` - Update merchant profile
- `POST   /api/v1/admin/shop-owners/{id}/reset-password` - Reset merchant password

### Shop Owner Portal (`role:shop_owner`)
- `GET    /api/v1/owner/dashboard` - Inventory counts and recent shop listings
- `GET    /api/v1/owner/shops` - List shops owned by current merchant
- `GET    /api/v1/owner/shops/{id}` - Shop settings profile
- `PUT    /api/v1/owner/shops/{id}` - Update shop settings
- `GET    /api/v1/owner/catalog` - Browse shared catalog with `is_listed` flag
- `POST   /api/v1/owner/products` - Create global product & auto-list in shop
- `GET    /api/v1/owner/shops/{shopId}/products` - List products in shop
- `POST   /api/v1/owner/shops/{shopId}/products` - Add existing catalog product with custom price
- `PUT    /api/v1/owner/shops/{shopId}/products/{listingId}` - Update listing price/details
- `DELETE /api/v1/owner/shops/{shopId}/products/{listingId}` - Remove listing from shop

### Public Storefront (No Auth Required)
- `GET /api/v1/storefront/{shopSlug}` - Public shop metadata, logo, and contact info
- `GET /api/v1/storefront/{shopSlug}/products` - Active products assigned to this shop
- `GET /api/v1/storefront/{shopSlug}/products/{productSlug}` - Product detail with fallbacks

---

## 9. Security & Architecture Design Notes

1. **Mass-Assignment Protection**: All models strictly declare `$fillable` attributes.
2. **Strict Foreign Key Constraints**: All relational tables enforce `ON DELETE CASCADE` or `RESTRICT` at the database level.
3. **Database Transactions**: Multi-record operations (e.g. creating a shop + owner account, creating a master product + shop listing) run within `DB::transaction()` to ensure atomicity.
4. **Tenant Isolation**: Owners cannot manipulate URL parameters or payload IDs to access or modify listings from shops they do not own. This is enforced via `EnsureUserHasRole` middleware and `ShopProductPolicy`.
5. **No Long-Lived Token Exposure**: Sanctum tokens are securely passed as HTTP Bearer headers and validated against database token records.
