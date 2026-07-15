# 🚌 FastX — Bus Ticket Booking System

A full-stack bus ticket booking web application built with **React (Vite)** on the frontend and **ASP.NET Core 8 (C#)** on the backend, backed by **PostgreSQL**.

---

## 📸 Application Screenshots

### 🏠 Home Page
![Home Page](screenshots/01-home.jpg)

### 🔍 Search Results
![Search Results](screenshots/02-search-results.jpg)

### 🔐 Login
![Login](screenshots/03-login.jpg)

### 📝 Register
![Register](screenshots/04-register.jpg)

### 🎫 My Bookings
![Bookings](screenshots/07-bookings.jpg)

### 🚌 Operator Dashboard
![Operator Dashboard](screenshots/05-operator-dashboard.jpg)

### 🛡️ Admin Console
![Admin Dashboard](screenshots/06-admin-dashboard.jpg)

---

## 🏗️ Project Structure

```
FastXBusBooking-React/
│
├── artifacts/
│   ├── fastx-web/               # ⚛️  React + Vite Frontend
│   │   └── src/
│   │       ├── pages/           # Home, Search, Seat Selection, Bookings, Profile
│   │       │                    # Operator (Dashboard, Buses, Routes, Bookings)
│   │       │                    # Admin (Dashboard, Users, Operators, Bookings)
│   │       ├── components/      # Reusable UI components (shadcn/ui)
│   │       ├── context/         # Auth context (JWT stored in localStorage)
│   │       ├── lib/             # Formatters, utilities
│   │       └── hooks/           # Custom React hooks
│   │
│   └── api-server/              # ⚙️  ASP.NET Core 8 C# Backend
│       └── FastX.Api/
│           ├── Controllers/     # Auth, Users, Buses, Routes, Bookings, Admin, Operator
│           ├── Models/          # User, Bus, BusRoute, Seat, Booking, BookingSeat
│           ├── DTOs/            # Request/Response data transfer objects
│           ├── Services/        # Auth, Bus, Route, Booking, Dashboard services
│           ├── Data/            # EF Core DbContext + PostgreSQL
│           └── Program.cs       # App startup, JWT config, CORS, seed data
│
└── lib/
    ├── api-client-react/        # Auto-generated React Query hooks (Orval)
    └── api-zod/                 # Auto-generated Zod validation schemas
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| UI Library | shadcn/ui, Tailwind CSS |
| State / Data | TanStack React Query |
| Routing | Wouter |
| Backend | ASP.NET Core 8, C# |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL (Npgsql) |
| Auth | JWT Bearer Tokens + BCrypt |
| API Docs | Swagger / OpenAPI |

---

## 🚀 Features

### 👤 Passenger
- Register & Login
- Search buses by origin, destination & date
- Filter by bus type (A/C Seater / Sleeper, Non A/C Seater / Sleeper)
- Interactive seat selection
- Book tickets & view booking history
- Cancel bookings

### 🚌 Bus Operator
- Operator registration & login
- Manage buses (add, edit, delete)
- Manage routes & schedules
- View all bookings on their routes
- Issue refunds

### 🛡️ Admin
- View all users & operators
- Manage all bookings
- Platform-wide dashboard with stats

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Passenger | alice@example.com | Alice@123 |
| Operator | operator@speedlines.com | Operator@123 |
| Admin | admin@fastx.com | Admin@123 |

---

## 🛣️ API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Passenger registration |
| POST | `/api/auth/login` | Passenger login |
| POST | `/api/auth/operator/register` | Operator registration |
| POST | `/api/auth/operator/login` | Operator login |

### Routes & Buses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/routes/search` | Search routes by origin, destination, date |
| GET | `/api/routes/{id}/seats` | Get seats for a route |
| GET | `/api/buses` | List buses (operator) |
| POST | `/api/buses` | Create bus |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get user bookings |
| DELETE | `/api/bookings/{id}` | Cancel booking |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/operators` | All operators |
| GET | `/api/admin/bookings` | All bookings |
| GET | `/api/admin/dashboard` | Platform stats |

---

## 🏃 Running Locally

### Backend (C#)
```bash
cd artifacts/api-server/FastX.Api
# Set your PostgreSQL connection string in environment
export DATABASE_URL="postgresql://user:password@localhost:5432/fastx"
dotnet run
# API runs on http://localhost:8080
# Swagger UI: http://localhost:8080/swagger
```

### Frontend (React)
```bash
cd artifacts/fastx-web
pnpm install
pnpm dev
# App runs on http://localhost:5173
```

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (production) |

---

## 📦 Available Cities / Routes

Mumbai, Pune, Goa, Nashik, Delhi, Agra, Jaipur, Lucknow, Chandigarh, Chennai, Bangalore, Hyderabad, Mysore, Kolkata, Bhubaneswar

---

## 👩‍💻 Built With

- [React](https://react.dev/)
- [ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
