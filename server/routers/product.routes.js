import express from "express";

import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    updateProduct
} from "../controllers/product.controller.js";

import { adminOnly } from "../middleware/admin.middleware.js";
import { protect } from "../middleware/auth.middleware.js";


const route = express.Router();

// Public routes
route.get("/", getProducts);
route.get("/:id", getProductById);

// Admin routes
route.post("/", protect, adminOnly, createProduct);
route.put("/:id", protect, adminOnly, updateProduct);
route.delete("/:id", protect, adminOnly, deleteProduct);

export default route;