import express from "express";

import {
    addToCart,
    clearCart,
    getCart,
    removeCartItem,
    updateCartItem
} from "../controllers/cart.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const route = express.Router();

route.get("/", protect, getCart);

route.post("/add", protect, addToCart);

route.put("/update/:productId", protect, updateCartItem);

route.delete("/remove/:productId", protect, removeCartItem);

route.delete("/clear", protect, clearCart);

export default route;