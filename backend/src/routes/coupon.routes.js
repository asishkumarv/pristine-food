import express from "express";
import {
  createCoupon,
  getCoupons,
  validateCoupon,
} from "../controllers/coupon.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ADMIN */
router.post("/", protect, adminProtect, createCoupon);
router.get("/", protect, adminProtect, getCoupons);

/* USER (CHECKOUT VALIDATION) */
router.post("/validate", protect, validateCoupon);

export default router;
