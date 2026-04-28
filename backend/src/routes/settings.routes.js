import express from "express";
import upload from "../middleware/settingsUpload.middleware.js";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

/* PUBLIC */
router.get("/public", getSettings);

/* ADMIN */
router.get("/", protect, adminProtect, getSettings);
router.put(
  "/",
  protect,
  adminProtect,
  upload.single("logo"),
  updateSettings
);

export default router;
