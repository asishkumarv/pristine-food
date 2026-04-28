import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/avatarUpload.middleware.js";
import {
  getMyProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsersAdmin,
} from "../controllers/user.controller.js";

import {adminProtect} from "../middleware/admin.middleware.js"
const router = express.Router();

router.get("/me", protect, getMyProfile);

// ADMIN: Get all users
router.get("/", adminProtect, getAllUsersAdmin);

router.put(
  "/me",
  protect,
  upload.single("avatar"), 
  updateProfile
);

router.post("/address", protect, addAddress);
router.put("/address/:addressId", protect, updateAddress);
router.delete("/address/:addressId", protect, deleteAddress);
router.patch("/address/:addressId/default", protect, setDefaultAddress);

export default router;
