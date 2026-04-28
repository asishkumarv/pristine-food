import express from "express";
import {
  registerAdmin,
  adminLogin,
  getDashboardStats,
  getMonthlyRevenue,
  getTopProducts,
  getAllOrders,
  getAllSubscriptions,
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/register", registerAdmin);
router.post("/login", adminLogin);

/* ================= DASHBOARD ================= */
router.get("/dashboard", protect, adminProtect, getDashboardStats);
router.get("/revenue", protect, adminProtect, getMonthlyRevenue);
router.get("/top-products", protect, adminProtect, getTopProducts);

/* ================= ORDERS ================= */
router.get("/orders", protect, adminProtect, getAllOrders);

/* ================= SUBSCRIPTIONS ================= */
router.get("/subscriptions", protect, adminProtect, getAllSubscriptions);

export default router;
