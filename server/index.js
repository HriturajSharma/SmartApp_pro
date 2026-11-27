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

import adminRoutes from "./routers/admin.routes.js"
dotenv.config()
import dns from "node:dns"

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express()
app.use(cors({
  origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
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