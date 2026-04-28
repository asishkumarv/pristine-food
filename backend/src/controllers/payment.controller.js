import asyncHandler from "express-async-handler";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";
import Product from "../models/product.model.js";


dotenv.config();

//
// 💰 Create Razorpay Order
//
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    res.status(400);
    throw new Error("Amount & OrderId required");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: orderId,
  });

  res.json({
    success: true,
    razorpayOrder,
  });
});


//
// ✅ Verify Payment and Save Order
//
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Invalid Razorpay signature");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.paymentStatus = "PAID";
  order.status = "CONFIRMED";
  order.razorpay_payment_id = razorpay_payment_id;

  // 🔒 STOCK DEDUCTION ONLY HERE
  for (const item of order.orderItems) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { "variants.$[v].stock": -item.quantity } },
      { arrayFilters: [{ "v.sku": item.variantSku }] }
    );
  }

  await order.save();

  res.json({
    success: true,
    message: "Payment verified successfully",
    order,
  });
});


//
// 📦 Fetch My Payments (User)
//
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user?.id || null }).sort({ createdAt:-1 });
  res.status(200).json({ success:true, payments });
});

//
// 🧭 Fetch All Payments (Admin)
//
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate("user", "name email").sort({ createdAt:-1 });
  res.status(200).json({ success:true, payments });
});


export const createSubscriptionPaymentOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Invalid amount");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `sub_${Date.now()}`,
  });

  res.json({
    success: true,
    razorpayOrder,
  });
});


export const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    subscriptionId,
    amount,
  } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Invalid Razorpay signature");
  }

  // 🔐 Save payment
  const payment = await Payment.create({
    user: req.user.id,
    subscription: subscriptionId,
    paymentType: "SUBSCRIPTION",
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    status: "PAID",
  });

  res.json({
    success: true,
    message: "Subscription payment verified",
    payment,
  });
});
