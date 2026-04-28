import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

// Create order (checkout)
router.post("/", protect, createOrder);
router.put("/:id/status", protect, adminProtect, updateOrderStatus);

// Logged-in user's orders
router.get("/my", protect, getMyOrders);

// Get single order (user or admin)
router.get("/:id", protect, getOrderById);

/* ================= ADMIN ROUTES ================= */

// All orders (admin)
router.get("/", protect, adminProtect, getAllOrders);

// Update order status (admin)


export default router;
