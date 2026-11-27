import express from "express";

import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
    updateCategory
} from "../controllers/category.controller.js";

import { adminOnly } from "../middleware/admin.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const route = express.Router();

// Public routes
route.get("/", getCategories);
route.get("/:id", getCategoryById);

// Admin routes
route.post("/", protect, adminOnly, createCategory);
route.put("/:id", protect, adminOnly, updateCategory);
route.delete("/:id", protect, adminOnly, deleteCategory);

export default route;