import cookieParser from "cookie-parser"
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './config/db.js'

import bannerRoutes from "./routers/banner.routes.js"
import cartRoutes from "./routers/cart.routes.js"
import categoryRoutes from "./routers/category.routes.js"
import orderRoutes from "./routers/order.routes.js"
import productRoutes from "./routers/product.routes.js"
import userRoutes from "./routers/user.route.js"

import dns from "node:dns"
import adminRoutes from "./routers/admin.routes.js"
dotenv.config()

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express()
const allowedOrigins = [
  "http://localhost:5173",
  "https://smartapppro-forntend.vercel.app",
  ...(process.env.CLIENT_URL || "").split(",")
]
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const isVercelPreview =
      url.protocol === "https:" &&
      /^smartapppro-forntend(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(url.hostname);
    const isLocalDevelopment =
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      (/^(localhost|127\.0\.0\.1)$/.test(url.hostname) ||
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(url.hostname) ||
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname));

    return isVercelPreview || isLocalDevelopment;
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    console.warn(`CORS rejected origin: ${origin}`);
    callback(null, false);
  },
  credentials: true
}))


const PORT  = process.env.PORT || 4040

await connectDB()
app.get('/health', (req, res) => {
  res.send('Hello, fdfdfdfd')
})
app.use(express.json());
app.use(cookieParser());


app.use("/api/user", userRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})