# Database Architecture & Migration Guide

## 1. Engine & Configuration
- **Database Engine**: MySQL 8.0+ / MariaDB 10.4+
- **ORM**: Prisma Client v5.22+
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Monetary Precision**: All currency amounts (INR) use `Decimal(12, 2)` to eliminate floating-point rounding errors.

---

## 2. Relational Schema Modules

### 2.1 Identity & RBAC
- `users`: Core identity table with unique `email` and `phone`, bcrypt `passwordHash`, and verification flags.
- `roles`: Role definitions (`BUYER`, `SELLER`, `SUPPORT`, `MODERATOR`, `FINANCE`, `ADMIN`, `SUPER_ADMIN`).
- `user_roles`: Pivot table mapping users to multiple system roles.
- `sessions`: Persistent hashed refresh tokens, client user-agent, IP address, and expiry timestamps.
- `otp_attempts`: Records phone/email OTP verification cycles with retry counters and expiration guards.

### 2.2 Businesses & Verification
- `businesses`: Indian business profiles containing legal name, 15-character Indian `gstin` (unique), business type (`MANUFACTURER`, `WHOLESALER`, `DISTRIBUTOR`, `EXPORTER`, `IMPORTER`, `SERVICE_PROVIDER`, `RETAILER`), verification status (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `SUSPENDED`), trust scores, and response metrics.
- `business_members`: Multi-tenant business membership mapping users to businesses with business-scoped roles (`OWNER`, `MANAGER`, `STAFF`).
- `business_addresses`: Physical manufacturing/office addresses with street, city, state, postal code (PIN), and country.
- `business_documents`: Uploaded GST, PAN, and trade license records with review audit trail.

### 2.3 Product Catalogue
- `categories`: Hierarchical category tree using self-referential `parentId`.
- `products`: Product listings with business ownership, category linkage, B2B Minimum Order Quantity (`minOrderQuantity`), Unit of Measure (`PIECE`, `BOX`, `TON`, `METER`, `KG`, `LITRE`), base unit price, and trade flags (`isB2B`, `isB2C`).
- `product_images`: Ordered image URLs with primary image flags.
- `price_tiers`: Volume-based wholesale pricing brackets (`minQuantity`, `maxQuantity`, `price`).

### 2.4 B2B RFQ, Inquiries & Quotations
- `requirements`: Buyer posted buying requirements with quantity, unit, target price, delivery location, and expiration.
- `inquiries`: Direct buyer-to-seller product inquiries and custom quotation requests.
- `quotations`: Formal quotations with line items, tax amount, shipping charges, payment terms, and validity date.
- `quotation_items`: Detailed quotation line items.

### 2.5 CRM & Orders
- `leads`: Seller CRM pipeline stages (`NEW`, `CONTACTED`, `QUALIFIED`, `QUOTATION_SENT`, `NEGOTIATION`, `WON`, `LOST`).
- `lead_notes`: Private seller internal notes (never accessible to buyers).
- `carts` & `cart_items`: B2C retail cart state.
- `orders` & `order_items`: Confirmed orders with transactional status flow.

---

## 3. Database Commands

```bash
# Push schema directly to database
npm run prisma:push --workspace=apps/api

# Generate Prisma Client
npm run prisma:generate --workspace=apps/api

# Run Seed Script (loads demo roles, suppliers, categories & products)
npm run prisma:seed --workspace=apps/api
```

