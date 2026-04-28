import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { uploadImage } from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

// POST /api/upload — admin only
router.post("/", protect, adminProtect, upload.single("image"), uploadImage);

export default router;
