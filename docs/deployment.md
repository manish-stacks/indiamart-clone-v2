# Deployment, DevOps & Infrastructure Guide

## 1. Local Development Setup

### Prerequisites
- Node.js v20+ LTS
- MySQL 8.0+ or MariaDB 10.4+
- Redis 7+

### Step-by-Step Launch
```bash
# 1. Install all dependencies across monorepo workspaces
npm install

# 2. Build the shared TypeScript library
npm run build:shared

# 3. Synchronize database schema and seed demo data
npm run prisma:push --workspace=apps/api
npm run prisma:seed --workspace=apps/api

# 4. Start NestJS Backend API (Port 4000)
npm run dev:api

# 5. In a separate terminal, start Next.js Frontend (Port 3001)
npm run dev:web
```

---

## 2. Docker Compose Deployment

A production-ready `docker-compose.yml` is provided at the repository root:
```bash
# Start MySQL & Redis containers
docker-compose up -d
```

---

## 3. Production Readiness Checklist
- [x] Strict TypeScript compilation across API, Web, and Shared packages.
- [x] Environment variable placeholders isolated in `.env.example`.
- [x] Automated Jest unit and integration tests passing.
- [x] Next.js production build verified (`next build`).
- [x] Swagger OpenAPI interactive documentation live at `/api/docs`.

