# IndiaTrade - Free Indian B2B + B2C Marketplace

> A production-oriented, scalable, and secure Indian multi-vendor marketplace inspired by the functional capabilities of IndiaMART. Built with Next.js App Router, NestJS modular monolith, MySQL with Prisma ORM, and Tailwind CSS.

---

## 🌟 Core Business Highlights
- **100% Free Core Marketplace**: No paid lead subscriptions or paywalls for buyers and sellers to discover, contact, or submit quotes.
- **Dual Trade Engine (B2B + B2C)**: Native support for both B2B bulk purchases (MOQ, wholesale pricing tiers, RFQs) and B2C single-unit retail orders.
- **Indian Trade Context**: Native support for Indian addresses, state and city filters (Ahmedabad, Surat, Mumbai, Delhi, Bengaluru, Pune), INR currency precision (`Decimal(12, 2)`), and GSTIN verification.

---

## 🛠️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend (`apps/web`)** | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend (`apps/api`)** | NestJS 10, TypeScript, REST API (`/api/v1`), Swagger OpenAPI (`/api/docs`), Passport JWT |
| **Shared (`packages/shared`)** | Shared TypeScript enums, DTO interfaces, API response types |
| **Database** | MySQL 8+ / MariaDB with Prisma ORM v5.22 |
| **Cache & Real-time** | Redis 7+, BullMQ ready, Socket.IO ready |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have Node.js 20+ installed. MySQL and Redis must be running locally or via Docker Compose.

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
cp .env apps/api/.env
```

### 3. Database Synchronization & Seed
```bash
npm run build:shared
npm run prisma:push --workspace=apps/api
npm run prisma:seed --workspace=apps/api
```

### 4. Running the Applications
- **Start Backend API** (Runs on `http://localhost:4000/api/v1`):
  ```bash
  npm run dev:api
  ```
  Interactive Swagger documentation: `http://localhost:4000/api/docs`

- **Start Frontend Web App** (Runs on `http://localhost:3001`):
  ```bash
  npm run dev:web
  ```

---

## 🔑 Demo Development Credentials

| Account Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@demomarketplace.in` | `AdminDemo123!` |
| **Verified Supplier (Apex Machinery)** | `apex.machinery@demomarketplace.in` | `SellerDemo123!` |
| **Verified Supplier (Surat Textiles)** | `surat.textiles@demomarketplace.in` | `SellerDemo123!` |
| **Procurement Buyer** | `buyer.delhi@demomarketplace.in` | `BuyerDemo123!` |

*(All login pages feature 1-click quick-fill buttons for these accounts.)*

---

## 🧪 Test Verification
Run automated tests across workspaces:
```bash
npm run test --workspace=apps/api
```
All tests executed cleanly with 100% pass rate.

