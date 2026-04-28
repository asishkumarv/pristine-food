import express from "express";
import {
  createVideo,
  getVideos,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js"; 

const router = express.Router();

/* PUBLIC */
router.get("/", getVideos);

/* ADMIN */
router.post(
  "/",
  protect,
  adminProtect,
  upload.single("video"), // ✅ MEMORY STORAGE
  createVideo
);

router.put("/:id", protect, adminProtect, updateVideo);
router.delete("/:id", protect, adminProtect, deleteVideo);

export default router;
