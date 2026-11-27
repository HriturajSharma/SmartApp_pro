import express from "express";

import {
    createOrder,
    createRazorpayOrder,
    getMyOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    verifyRazorpayPayment
} from "../controllers/order.controller.js";

import { adminOnly } from "../middleware/admin.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const route = express.Router();

// Customer routes
route.post("/", protect, createOrder);
route.get("/my-orders", protect, getMyOrders);
route.get("/track", trackOrder);
route.get("/:id", protect, getOrderById);

route.post("/:id/payment", protect, createRazorpayOrder);
route.post("/:id/verify-payment", protect, verifyRazorpayPayment);

// Admin routes
route.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default route;