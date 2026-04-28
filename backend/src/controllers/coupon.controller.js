import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.model.js";

/* ================= CREATE COUPON (ADMIN) ================= */
export const createCoupon = asyncHandler(async (req, res) => {
  let {
    code,
    type,
    value,
    minCartValue,
    maxDiscount,
    expiry,
  } = req.body;

  if (value <= 0) {
    res.status(400);
    throw new Error("Coupon value must be greater than zero");
  }

  const normalizedCode = code.toUpperCase();

  const exists = await Coupon.findOne({ code: normalizedCode });
  if (exists) {
    res.status(400);
    throw new Error("Coupon already exists");
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    type,
    value,
    minCartValue,
    maxDiscount,
    expiry,
  });

  res.status(201).json({
    success: true,
    coupon,
  });
});

/* ================= GET ALL COUPONS (ADMIN) ================= */
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    coupons,
  });
});

/* ================= APPLY COUPON (CHECKOUT) ================= */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    res.status(400);
    throw new Error("Invalid coupon code");
  }

  if (new Date(coupon.expiry) < new Date()) {
    res.status(400);
    throw new Error("Coupon expired");
  }

  if (cartTotal < coupon.minCartValue) {
    res.status(400);
    throw new Error(
      `Minimum cart value ₹${coupon.minCartValue} required`
    );
  }

  let discount = 0;

  if (coupon.type === "PERCENT") {
    discount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  if (coupon.type === "FLAT") {
    discount = coupon.value;
  }

  discount = Math.min(discount, cartTotal);

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discount,
    },
  });
});
