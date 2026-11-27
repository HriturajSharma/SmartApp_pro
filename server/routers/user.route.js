import express from "express";
import {
    getMe,
    login,
    logout,
    register
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const userRoute = express.Router();

userRoute.post("/register", register);
userRoute.post("/login", login);
userRoute.post("/logout", logout);
userRoute.get("/me", protect, getMe);

export default userRoute;
