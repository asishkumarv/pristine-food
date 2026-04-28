import asyncHandler from "express-async-handler";
import Settings from "../models/settings.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadLogoToCloudinary } from "../middleware/settingsUpload.middleware.js";

/* ================= GET SETTINGS ================= */
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({ storeName: "Hunger Bites" });
  }

  res.status(200).json({
    success: true,
    settings,
  });
});

/* ================= UPDATE SETTINGS ================= */
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  const { storeName, supportEmail, supportPhone, address } = req.body;

  if (storeName !== undefined) settings.storeName = storeName;
  if (supportEmail !== undefined) settings.supportEmail = supportEmail;
  if (supportPhone !== undefined) settings.supportPhone = supportPhone;
  if (address !== undefined) settings.address = address;

  /* LOGO UPDATE */
  if (req.file) {
    // 🔥 Delete old logo from Cloudinary
    if (settings.logo?.public_id) {
      await cloudinary.uploader.destroy(settings.logo.public_id);
    }

    const uploadedLogo = await uploadLogoToCloudinary(req.file.buffer);
    settings.logo = uploadedLogo;
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: "Settings updated successfully ✅",
    settings,
  });
});
