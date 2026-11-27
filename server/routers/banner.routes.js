import express from "express";

import {
    createBanner,
    deleteBanner,
    getBanners,
    updateBanner
} from "../controllers/banner.controller.js";

import { adminOnly } from "../middleware/admin.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const route = express.Router();

// Public route
route.get("/", getBanners);

// Admin routes
route.post("/", protect, adminOnly, createBanner);
route.put("/:id", protect, adminOnly, updateBanner);
route.delete("/:id", protect, adminOnly, deleteBanner);

export default route;