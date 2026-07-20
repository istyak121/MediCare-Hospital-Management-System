# 🏥 MediCare HMS

A production-ready Hospital Management System built with **Next.js 15 (App Router)** + **NestJS 11** + **PostgreSQL** + **TypeORM**.

Supports 9 user roles, bilingual UI (English + Bengali via `next-intl`), and the full hospital workflow: patient registration, appointments, prescriptions, lab tests, pharmacy, IPD/beds, billing, and analytics.

## Project Structure

```
HMS/
├── backend/     # NestJS API (TypeORM + PostgreSQL)
├── frontend/    # Next.js 15 App Router (Tailwind v4 + shadcn/ui)
├── shared/      # Shared TypeScript types + Zod schemas
└── package.json # npm workspaces root
```

## Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** (running on port 5432)

> Docker and Redis are **not required** for development. Docker Compose files are included for production packaging; Redis is auto-replaced by an in-memory fallback in dev.

## Quick Start

```bash
# 1. Install all dependencies (backend + frontend + shared)
npm install

# 2. Configure environment
cp .env.example backend/.env
#   → edit backend/.env with your DB credentials (defaults: postgres / 1234)

# 3. Create the database & run migrations + seed demo data
npm run seed

# 4. Start both backend and frontend in parallel
npm run dev
```

- **Backend API:** http://localhost:5000
- **Swagger docs:** http://localhost:5000/api/docs
- **Frontend app:** http://localhost:3000

## Default Seed Credentials

| Role          | Email                    | Password      |
|---------------|--------------------------|---------------|
| Super Admin   | admin@medicare.com       | Admin@123     |
| Doctor        | doctor@medicare.com     | Doctor@123    |
| Receptionist  | reception@medicare.com   | Reception@123 |
| Nurse         | nurse@medicare.com       | Nurse@123     |

## Tech Stack

| Layer     | Technology                                             |
|-----------|--------------------------------------------------------|
| Frontend  | Next.js 15, Tailwind CSS v4, shadcn/ui, next-intl, TanStack Query, Zustand, Recharts |
| Backend   | NestJS 11, TypeORM 0.3, JWT, Passport, Swagger, Throttler |
| Database  | PostgreSQL 16+                                         |

## License

Proprietary — All rights reserved.
