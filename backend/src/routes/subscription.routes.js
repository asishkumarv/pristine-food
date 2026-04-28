import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createSubscription,
  getMySubscriptions,
  pauseSubscription,
  cancelSubscription,
  resumeSubscription,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.post("/", protect, createSubscription);
router.get("/my", protect, getMySubscriptions);
router.put("/:id/pause", protect, pauseSubscription);
router.put("/:id/resume", protect, resumeSubscription);
router.put("/:id/cancel", protect, cancelSubscription);

export default router;
