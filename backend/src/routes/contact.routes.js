import express from "express";
import {
  submitContactMessage,
  getAllContactMessages,
  deleteContactMessage,
  markMessageReplied,
} from "../controllers/contact.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

// USER — Public route: send message
router.post("/submit", submitContactMessage);

// ADMIN — Protected routes
router.get("/", protect, adminProtect, getAllContactMessages);
router.delete("/:id", protect, adminProtect, deleteContactMessage);
router.put("/:id/reply", protect, adminProtect, markMessageReplied);

export default router;
