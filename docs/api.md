# REST API Specification & Endpoints Guide

## 1. Overview
- **Base Route**: `http://localhost:4000/api/v1`
- **Interactive Swagger Documentation**: `http://localhost:4000/api/docs`
- **Default Format**: JSON (`application/json`)
- **Authentication**: Bearer JWT in `Authorization` header (`Bearer <accessToken>`) or HttpOnly `accessToken` cookie.

---

## 2. API Response Standard

All API responses follow a uniform envelop structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-10-21T12:00:00.000Z",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

---

## 3. Endpoints Matrix

### 3.1 Authentication (`/auth`)
| Method | Path | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account (Buyer or Seller) | Public |
| `POST` | `/auth/login` | Login with email and password | Public |
| `POST` | `/auth/refresh` | Rotate refresh token and get new access token | Public |
| `POST` | `/auth/logout` | Invalidate current user session | Authenticated |
| `GET` | `/auth/me` | Get current user profile and business memberships | Authenticated |

### 3.2 Businesses & Suppliers (`/businesses`)
| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/businesses` | List suppliers with city, type, and verification filters | Public |
| `GET` | `/businesses/:slug` | Get public business storefront & catalogue | Public |
| `POST` | `/businesses` | Self-register business storefront (auto OWNER role) | Authenticated |
| `PUT` | `/businesses/:businessId` | Update business profile details | Business Owner/Manager |

### 3.3 Categories (`/categories`)
| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/categories` | Get hierarchical category tree | Public |
| `GET` | `/categories/:slug` | Get category with subcategories | Public |

### 3.4 Products & Catalogue (`/products`)
| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/products/search` | Search products by keyword, category, city, price, and trade type | Public |
| `GET` | `/products/:slug` | Get product details, bulk price tiers, and seller card | Public |
| `POST` | `/products` | Create product listing with images and price tiers | Business Owner/Manager |

### 3.5 Inquiries & Leads (`/inquiries`)
| Method | Path | Description | Access |
|---|---|---|---|
| `POST` | `/inquiries` | Submit buyer inquiry (auto-resolves buyer or captures guest name/phone/email, creates CRM lead) | Public / Authenticated |
| `GET` | `/inquiries/my` | Get inquiries submitted by current buyer | Authenticated Buyer |
| `GET` | `/inquiries/business/:businessId` | Get inquiries & leads received by supplier business | Business Owner/Staff |

