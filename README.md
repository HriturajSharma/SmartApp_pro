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

The Vite development server proxies API requests to the local backend at `http://localhost:8000` by default. Start the server in a separate terminal first. The dev script listens on the LAN, so a phone on the same Wi-Fi can use the computer's LAN IP and port `5173`. To use another backend, create `.env.local`:

```env
VITE_API_PROXY_TARGET=https://server-production-4af20ab4.up.railway.app
```

Use the port configured by `PORT` in `server/.env` if it differs from `8000`, then restart Vite. Production deployments continue to use the API rewrite in `vercel.json`. Accounts and seeded demo users exist only in the database where they were registered/seeded, so local and production credentials are not interchangeable. Do not proxy a production Secure cookie through a plain-HTTP phone dev URL; the browser can reject it, causing cart requests to lose authentication.

Start:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

Live project: [SmartLife Store](https://smart-app-pro.vercel.app/)

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Demo Accounts

These accounts are created by `npm run seed` and work only against the MongoDB database that was seeded. Local and production databases may have different users.

| Name | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@example.com` | `Admin@123` | Admin |
| User1 | `john@example.com` | `User@123` | User |
| User2 | `jane@example.com` | `User@456` | User |

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS 4, Axios, lucide-react |
| Backend | Node.js, Express 5, REST API |
| Database | MongoDB with Mongoose |
| Authentication | JWT in HTTP-only cookies, bcrypt password hashing |
| Payments | Razorpay Checkout and server-side payment verification |
| Deployment | Vercel frontend, Railway API |

## Project Implementation

- **Storefront:** responsive home page with hero, categories, featured products, promotional banners and support information.
- **Product discovery:** product listing and detail pages with category, search, wattage/capacity and auto-shutoff filters, sorting, stock information and product specifications.
- **Account and access control:** registration/login, HTTP-only JWT session, user profile and order history; admin-only dashboard and management pages are protected by role.
- **Cart and orders:** authenticated cart with quantity updates and server-side stock/price validation when an order is created.
- **Administration:** dashboard, product management, category/banner management, and order management/detail views.
- **API architecture:** frontend service modules call Express REST endpoints for users/auth, products, categories, banners, carts, orders and admin operations.

## Payment Method

Checkout currently uses **Razorpay**. The customer enters shipping details, the backend creates an order from the signed-in user's cart, and the backend creates a Razorpay payment order. Razorpay Checkout collects payment details. The server verifies the Razorpay signature and captured payment before marking the order paid, deducting stock, and clearing the cart. Razorpay credentials must be configured on the backend; never put the key secret in frontend code.

Although the order schema recognizes other payment method values, the current checkout UI only offers Razorpay; Stripe and cash-on-delivery flows are not implemented.

## Authentication

- Uses HTTP-only JWT cookies.
- Frontend also stores basic user details for route protection.
- Authenticated sessions are validated through `GET /api/auth/me`.
- Protected admin routes require `role: "admin"`.

## Main Pages

| Route | Page |
|---|---|
| `/` | Home/storefront |
| `/products` | Product listing and filters |
| `/products/:id` | Product details |
| `/login`, `/register` | Authentication |
| `/cart`, `/checkout` | Protected cart and Razorpay checkout |
| `/track-order` | Public order tracking |
| `/profile` | Protected customer profile |
| `/my-orders` | Protected order history |
| `/my-orders/:id` | Protected order details |
| `/admin` | Admin dashboard |
| `/admin/products`, `/admin/products/add`, `/admin/products/edit/:id` | Admin product management |
| `/admin/categories` | Admin category management |
| `/admin/banners` | Admin banner management |
| `/admin/orders`, `/admin/orders/:id` | Admin order management/details |

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

Backend URL: `http://localhost:8000` (or the configured `PORT`)

Configure `server/.env` with:

```env
PORT=8000
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<secure_secret>
NODE_ENV=development
CLIENT_URL=https://your-custom-store-domain.com
RAZORPAY_KEY_ID=<key_id>
RAZORPAY_KEY_SECRET=<key_secret>
```

The API CORS policy allows this project's Vercel deployments and exact origins listed in `CLIENT_URL` (comma-separated for multiple custom domains). After changing the backend CORS policy or `CLIENT_URL` on Railway, redeploy/restart the backend for mobile login requests to use the update.

Never commit real database passwords, JWT secrets, or Razorpay credentials.
