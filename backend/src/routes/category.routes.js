import express from "express";
import {
  createCategory,
  getCategories,
  getActiveCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getCategories);
router.get("/active", getActiveCategories);

/* ADMIN */
router.post(
  "/",
  protect,
  adminProtect,
  upload.single("image"),
  createCategory
);

router.put(
  "/:id",
  protect,
  adminProtect,
  upload.single("image"),
  updateCategory
);

router.delete("/:id", protect, adminProtect, deleteCategory);

export default router;
