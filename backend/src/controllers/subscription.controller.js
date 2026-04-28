import Subscription from "../models/subscription.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "express-async-handler";
import Payment from "../models/payment.model.js";

/* ================= CREATE SUBSCRIPTION ================= */
export const createSubscription = asyncHandler(async (req, res) => {
  const {
    productId,
    variantSku,
    frequency = "DAILY",
    quantityPerDay = 1,
    startDate,
    addressId,
    paymentId,
  } = req.body;

  if (!productId || !variantSku || !startDate || !addressId || !paymentId) {
    res.status(400);
    throw new Error("Missing required subscription fields");
  }

  const payment = await Payment.findById(paymentId);
  if (!payment || payment.status !== "PAID") {
    res.status(400);
    throw new Error("Payment not verified");
  }

  let durationDays = 1;
  if (frequency === "WEEKLY") durationDays = 7;
  if (frequency === "MONTHLY") durationDays = 30;

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  const subscription = await Subscription.create({
    user: req.user._id,
    product: productId,
    variantSku,
    frequency,
    quantityPerDay,
    startDate,
    endDate,
    addressId,
    totalAmount: payment.amount,
    payment: {
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
    },
    status: "ACTIVE",
  });

  res.status(201).json({ success: true, subscription });
});

/* ================= GET MY SUBSCRIPTIONS ================= */
export const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({
    user: req.user._id,
  })
    .populate("product")
    .sort({ createdAt: -1 });

  res.json({ success: true, subscriptions });
});

/* ================= PAUSE ================= */
export const pauseSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!sub) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  sub.status = "PAUSED";
  await sub.save();

  res.json({ success: true, subscription: sub });
});

/* ================= RESUME ================= */
export const resumeSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!sub) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  if (sub.status !== "PAUSED") {
    res.status(400);
    throw new Error("Subscription is not paused");
  }

  sub.status = "ACTIVE";
  await sub.save();

  res.json({ success: true, subscription: sub });
});

/* ================= CANCEL ================= */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!sub) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  sub.status = "CANCELLED";
  await sub.save();

  res.json({ success: true, subscription: sub });
});
