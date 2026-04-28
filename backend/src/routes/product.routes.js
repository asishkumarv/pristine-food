import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductFlags,
  addProductReview,
} from "../controllers/product.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/", getProducts);
router.get("/:id", getProductById);

/* ================= USER ================= */
router.post("/:id/review", protect, addProductReview);

/* ================= ADMIN ================= */
router.post(
  "/",
  protect,
  adminProtect,
  upload.array("images", 6),
  createProduct
);

router.put(
  "/:id",
  protect,
  adminProtect,
  upload.array("images", 6),
  updateProduct
);

router.patch(
  "/:id/flags",
  protect,
  adminProtect,
  toggleProductFlags
);

router.delete("/:id", protect, adminProtect, deleteProduct);

export default router;
