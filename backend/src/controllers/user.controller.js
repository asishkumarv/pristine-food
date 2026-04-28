import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import upload, { uploadAvatarToCloudinary } from "../middleware/avatarUpload.middleware.js";

/* ================= GET MY PROFILE ================= */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    user,
  });
});

/* ================= UPDATE PROFILE ================= */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;

  /* 🔥 AVATAR UPLOAD */
  if (req.file) {
    // delete old avatar
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const uploadedAvatar = await uploadAvatarToCloudinary(req.file.buffer);
    user.avatar = uploadedAvatar;
  }

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

/* ================= ADD ADDRESS ================= */
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  const address = req.body;

  if (address.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(address);
  await user.save();

  res.status(201).json({
    success: true,
    message: "Address added",
    addresses: user.addresses,
  });
});

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);

  const address = user.addresses.id(addressId);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  Object.assign(address, req.body);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();

  res.json({
    success: true,
    message: "Address updated",
    addresses: user.addresses,
  });
});

/* ================= DELETE ADDRESS ================= */
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);

  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== addressId
  );

  await user.save();

  res.json({
    success: true,
    message: "Address removed",
    addresses: user.addresses,
  });
});

/* ================= SET DEFAULT ADDRESS ================= */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);

  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId;
  });

  await user.save();

  res.json({
    success: true,
    message: "Default address set",
    addresses: user.addresses,
  });
});


export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    users,
  });
});
