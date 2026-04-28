import asyncHandler from "express-async-handler";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import Coupon from "../models/Coupon.model.js";
import mongoose from "mongoose";

/* ================= CREATE ORDER ================= */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    couponCode, // 🔑 only code from frontend
  } = req.body;

  /* ---------- BASIC VALIDATION ---------- */
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address required");
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error("Payment method required");
  }

  /* ---------- VERIFY ITEMS & CALCULATE SUBTOTAL ---------- */
  let subtotal = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const variant = product.variants.find(
      (v) => v.sku === item.variantSku
    );

    if (!variant) {
      res.status(400);
      throw new Error("Variant not found");
    }

    if (variant.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${variant.sku}`);
    }

    // 🔒 Lock price
    item.price = variant.price;
    subtotal += variant.price * item.quantity;
  }

  /* ---------- APPLY COUPON (OPTIONAL) ---------- */
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      res.status(400);
      throw new Error("Invalid coupon");
    }

    if (new Date(coupon.expiry) < new Date()) {
      res.status(400);
      throw new Error("Coupon expired");
    }

    if (subtotal < coupon.minCartValue) {
      res.status(400);
      throw new Error(
        `Minimum cart value ₹${coupon.minCartValue} required`
      );
    }

    if (coupon.type === "PERCENT") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    if (coupon.type === "FLAT") {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal);
    appliedCoupon = coupon.code;
  }

  const total = subtotal - discount;

  /* ---------- CREATE ORDER ---------- */
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: "PENDING",
    status: "CONFIRMED",

    priceSummary: {
      subtotal,
      discount,
      total,
    },

    coupon: appliedCoupon,
  });

  /* ---------- REDUCE STOCK (COD ONLY) ---------- */
  if (paymentMethod === "COD") {
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { "variants.$[v].stock": -item.quantity } },
        { arrayFilters: [{ "v.sku": item.variantSku }] }
      );
    }
  }

  /* ---------- CLEAR USER CART ---------- */
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], coupon: null }
  );

  res.status(201).json({
    success: true,
    order,
  });
});

/* ================= USER ORDERS ================= */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
  .populate("orderItems.productId", "productName images variants")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders,
  });
});

/* ================= SINGLE ORDER ================= */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid order id");
  }

  const order = await Order.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({ success: true, order });
});

/* ================= ADMIN: ALL ORDERS ================= */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "fullName email")
    .populate("orderItems.productId", "productName images variants")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders,
  });
});

/* ================= ADMIN: UPDATE STATUS ================= */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();

  res.json({
    success: true,
    message: "Order status updated",
    order,
  });
});
