# FastX - Bus Ticket Booking

A full-stack bus ticket booking platform with a C# ASP.NET Core 8 backend and React + Vite frontend.

## Run & Operate

- **Frontend:** `pnpm --filter @workspace/fastx-web run dev` (served via `artifacts/fastx-web: web` workflow)
- **Backend:** `dotnet watch run --project FastX.Api/FastX.Api.csproj` (served via `artifacts/api-server: API Server` workflow)
- **Codegen:** `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml`
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Test Accounts (seeded on first run)

| Role      | Email                          | Password      |
|-----------|-------------------------------|---------------|
| Admin     | admin@fastx.com               | Admin@123     |
| Operator  | operator@speedlines.com       | Operator@123  |
| Operator  | operator@nationalbus.com      | Operator@123  |
| Passenger | alice@example.com             | Alice@123     |
| Passenger | bob@example.com               | Bob@123       |

## Stack

- **Frontend:** React 19, Vite, TanStack Query, Wouter, Tailwind CSS, shadcn/ui
- **Backend:** ASP.NET Core 8 Web API (C#), Entity Framework Core 8, Npgsql (PostgreSQL)
- **Auth:** JWT (HS256), BCrypt password hashing
- **DB:** PostgreSQL + EF Core (auto-migrated via `EnsureCreated` on startup)
- **API Codegen:** Orval (OpenAPI → React Query hooks + Zod schemas)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (don't edit)
- `artifacts/api-server/FastX.Api/` — C# ASP.NET Core project
  - `Models/` — EF Core entity models (User, Bus, BusRoute, Seat, Booking)
  - `Controllers/` — API controllers (Auth, Users, Buses, Routes, Bookings, Operator, Admin, Dashboard)
  - `Services/` — Business logic (AuthService, BusService, RouteService, BookingService, DashboardService)
  - `Data/FastXDbContext.cs` — EF Core DbContext
  - `Program.cs` — App startup, DI, JWT, CORS, seeding
- `artifacts/fastx-web/src/` — React frontend

## Architecture decisions

- **JWT stored in localStorage** under key `fastx_token`; attached to all API calls via custom-fetch mutator
- **Role-based routing**: passenger → home/bookings, operator → /operator/*, admin → /admin/*
- **EF Core `EnsureCreated`** used for schema creation (no migrations); safe for dev + first run
- **Seats auto-generated** when a route is created (4 columns A/B/C/D × N rows)
- **OpenAPI-first**: spec gates codegen which gates the React hooks; never hand-write types

## Product

Three-role booking platform:
- **Passengers** search routes, select seats interactively, book tickets, view history, cancel bookings
- **Operators** manage buses, create/edit routes, view bookings, process refunds
- **Admins** manage users, operators, and view all system bookings/stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run codegen before touching frontend code
- `dotnet watch` runs from `artifacts/api-server/` directory (not workspace root) — paths in artifact.toml are relative to that dir
- DB is seeded only on first run (`if (await db.Users.AnyAsync()) return;`) — reset by clearing tables or dropping the DB
- JWT key comes from `appsettings.Development.json` in dev; set `JWT_SECRET` env var in production
