# 🚌 FastX — Bus Ticket Booking System

A full-stack bus ticket booking web application built with **React + Vite (TypeScript)** on the frontend and **ASP.NET Core 8 (C#)** on the backend, backed by **PostgreSQL**.

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
├── src/                         # ⚛️  React Frontend Source
│   ├── components/
│   │   ├── layout/              # PassengerLayout, OperatorLayout, AdminLayout
│   │   └── ui/                  # shadcn/ui components (Button, Card, Input...)
│   ├── context/
│   │   └── auth-context.tsx     # JWT auth context (login, logout, user state)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/
│   │   └── formatters.ts        # Currency, date/time (IST), duration helpers
│   ├── pages/
│   │   ├── home.tsx             # Landing page with search
│   │   ├── search.tsx           # Route search results + filters
│   │   ├── seat-selection.tsx   # Interactive seat map + booking
│   │   ├── bookings.tsx         # Passenger booking history
│   │   ├── booking-detail.tsx   # Single booking detail + cancel
│   │   ├── profile.tsx          # User profile management
│   │   ├── login.tsx            # Passenger / Operator login
│   │   ├── register.tsx         # Passenger registration
│   │   ├── operator-register.tsx
│   │   ├── operator-dashboard.tsx
│   │   ├── operator-buses.tsx
│   │   ├── operator-routes.tsx
│   │   ├── operator-bookings.tsx
│   │   ├── admin-dashboard.tsx
│   │   ├── admin-users.tsx
│   │   ├── admin-operators.tsx
│   │   └── admin-bookings.tsx
│   ├── App.tsx                  # Routes (wouter)
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind CSS global styles
│
├── public/                      # Static assets
│
├── backend/                     # ⚙️  ASP.NET Core 8 C# Backend
│   ├── Controllers/
│   │   ├── AuthController.cs    # Register, Login (Passenger & Operator)
│   │   ├── UsersController.cs   # GET/PUT /api/users/me
│   │   ├── BusesController.cs   # CRUD /api/buses
│   │   ├── RoutesController.cs  # CRUD + search + seats /api/routes
│   │   ├── BookingsController.cs# Passenger bookings /api/bookings
│   │   ├── OperatorController.cs# Operator bookings + refunds
│   │   ├── AdminController.cs   # Admin: users, operators, bookings
│   │   └── DashboardController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Bus.cs
│   │   ├── BusRoute.cs
│   │   ├── Seat.cs
│   │   ├── Booking.cs
│   │   └── BookingSeat.cs
│   ├── DTOs/                    # Request/Response data contracts
│   ├── Services/                # AuthService, BusService, RouteService, BookingService
│   ├── Data/
│   │   └── FastXDbContext.cs    # EF Core DbContext + PostgreSQL
│   ├── Program.cs               # Startup: JWT, CORS, EF Core, Swagger, seed data
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── FastX.Api.csproj
│
├── screenshots/                 # App workflow screenshots
├── index.html                   # Vite HTML entry
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .prettierrc
├── .editorconfig
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| UI Components | shadcn/ui, Tailwind CSS v4 |
| State / Data Fetching | TanStack React Query v5 |
| Client-side Routing | Wouter |
| Forms & Validation | React Hook Form + Zod |
| Backend | ASP.NET Core 8, C# |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL (Npgsql) |
| Authentication | JWT Bearer Tokens + BCrypt |
| API Documentation | Swagger / OpenAPI |

---

## 🚀 Features

### 👤 Passenger
- Register & login
- Search buses by origin, destination & date
- Filter results by bus type (A/C Seater / A/C Sleeper / Non A/C Seater / Non A/C Sleeper)
- Interactive seat map — select/deselect seats visually
- Book tickets and view booking history
- Cancel bookings with automatic refund

### 🚌 Bus Operator
- Operator registration & login
- Manage buses (add, edit, delete)
- Manage routes & schedules
- View all passenger bookings on their routes
- Issue refunds

### 🛡️ Admin
- View & manage all users and operators
- Monitor all bookings across the platform
- Platform-wide dashboard with statistics

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Passenger | alice@example.com | Alice@123 |
| Operator | operator@speedlines.com | Operator@123 |
| Admin | admin@fastx.com | Admin@123 |

---

## 🛣️ REST API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Passenger registration |
| POST | `/api/auth/login` | Passenger login |
| POST | `/api/auth/operator/register` | Operator registration |
| POST | `/api/auth/operator/login` | Operator login |

### Routes & Buses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/routes/search?origin=&destination=&date=` | Search routes |
| GET | `/api/routes/{id}/seats` | Get seats for a route |
| GET | `/api/buses` | List operator's buses |
| POST | `/api/buses` | Create a new bus |
| PUT | `/api/buses/{id}` | Update bus |
| DELETE | `/api/buses/{id}` | Delete bus |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | Get current user's bookings |
| GET | `/api/bookings/{id}` | Get booking detail |
| DELETE | `/api/bookings/{id}` | Cancel a booking |

### Operator
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/operator/bookings` | All bookings on operator routes |
| POST | `/api/operator/bookings/{id}/refund` | Issue a refund |
| GET | `/api/operator/dashboard` | Operator stats |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | All passengers |
| GET | `/api/admin/operators` | All operators |
| GET | `/api/admin/bookings` | All bookings |
| GET | `/api/admin/dashboard` | Platform statistics |

---

## 🏃 Running Locally

### Prerequisites
- Node.js 18+ and npm
- .NET 8 SDK
- PostgreSQL

### Backend (C#)

```bash
cd backend

# Set your database connection string
export DATABASE_URL="postgresql://username:password@localhost:5432/fastxdb"

dotnet restore
dotnet run
# API runs at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger
```

### Frontend (React)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# App runs at http://localhost:5173
```

> **Note:** On first run the backend auto-creates the database schema and seeds demo data (users, buses, routes).

---

## 🔐 Environment Variables

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Secret key for JWT signing (production) |

---

## 🗺️ Available Routes (Seeded)

Mumbai ↔ Pune, Mumbai ↔ Goa, Mumbai ↔ Nashik, Mumbai ↔ Hyderabad, Mumbai ↔ Chennai,  
Delhi ↔ Agra, Delhi ↔ Jaipur, Delhi ↔ Lucknow, Delhi ↔ Chandigarh,  
Chennai ↔ Bangalore, Chennai ↔ Hyderabad, Bangalore ↔ Hyderabad, Bangalore ↔ Mysore,  
Kolkata → Bhubaneswar

---

## 👩‍💻 Built With

- [React](https://react.dev/) — Frontend UI library
- [Vite](https://vitejs.dev/) — Frontend build tool
- [ASP.NET Core 8](https://learn.microsoft.com/en-us/aspnet/core/) — Backend framework
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/) — ORM for PostgreSQL
- [shadcn/ui](https://ui.shadcn.com/) — Accessible UI components
- [TanStack Query](https://tanstack.com/query) — Server state management
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Wouter](https://github.com/molefrog/wouter) — Lightweight React router
