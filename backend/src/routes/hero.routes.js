import express from "express";
import {upload} from "../middleware/upload.middleware.js";

import {
  createHeroSlide,
  getHeroSlides,
  updateHeroSlide,
  deleteHeroSlide
} from "../controllers/hero.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public
router.get("/", getHeroSlides);

// Admin
router.post("/create", protect, adminProtect, upload.single("image"), createHeroSlide);
router.put("/:id", protect, adminProtect, upload.single("image"), updateHeroSlide);
router.delete("/:id", protect, adminProtect, deleteHeroSlide);

export default router;
