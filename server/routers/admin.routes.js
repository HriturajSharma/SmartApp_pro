
import express from "express";

import {
    getAllOrders,
    getDashboardStats,
    updateOrderStatus
} from "../controllers/admin.controller.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { protect } from "../middleware/auth.middleware.js";


const route = express.Router();

route.get("/dashboard", protect, adminOnly, getDashboardStats);
route.get("/orders", protect, adminOnly, getAllOrders);
route.put(
    "/orders/:id/status",
    protect,
    adminOnly,
    updateOrderStatus
);
export default route;
