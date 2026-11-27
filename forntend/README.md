# SmartLife Store — Frontend

React + Vite frontend for the SmartLife appliances application.

## Requirements

- Node.js 18+
- Running SmartLife backend
- MongoDB database

## Setup

```bash
cd forntend
npm install
```

Create `.env`:

```env
VITE_API_URL=https://server-production-4af20ab4.up.railway.app/api
```

Start:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

Live project: [SmartLife Store](https://smartapppro-forntend.vercel.app/)

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin@123` |
| User | `john@example.com` | `User@123` |

## Authentication

- Uses HTTP-only JWT cookies.
- Frontend also stores basic user details for route protection.
- Authenticated sessions are validated through `GET /api/auth/me`.
- Protected admin routes require `role: "admin"`.

## Main Pages

- `/` — Home
- `/products` — Product listing
- `/products/:id` — Product details
- `/cart` — Shopping cart
- `/checkout` — Checkout
- `/track-order` — Track an order
- `/login` — Login
- `/register` — Registration
- `/admin` — Admin dashboard
- `/admin/products` — Manage products
- `/admin/orders` — Manage orders
- `/categories` — Manage categories
- `/banners` — Manage banners

## API Services

| Area | Base Endpoint |
|---|---|
| Authentication | `/auth` |
| Products | `/products` |
| Categories | `/categories` |
| Banners | `/banners` |
| Cart | `/cart` |
| Orders | `/orders` |
| Admin | `/admin` |

## Backend Setup

```bash
cd server
npm install
npm run seed
npm run dev
```

Backend URL: `http://localhost:8000`

Configure `server/.env` with:

```env
PORT=8000
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<secure_secret>
NODE_ENV=development
RAZORPAY_KEY_ID=<key_id>
RAZORPAY_KEY_SECRET=<key_secret>
```

Never commit real database passwords, JWT secrets, or Razorpay credentials.
