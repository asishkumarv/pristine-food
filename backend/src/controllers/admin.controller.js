import asyncHandler from "express-async-handler";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";
import Subscription from "../models/subscription.model.js"

/* ================= ADMIN REGISTER (ONE TIME) ================= */
export const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, secretKey } = req.body;
  if (!email || !password || !fullName) {
    res.status(400);
    throw new Error("All fields required");
  }

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(403);
    throw new Error("Invalid Admin Secret Key");
  }

  const exists = await Admin.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
    },
  });
});

/* ================= ADMIN LOGIN ================= */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !(await admin.comparePassword(password))) {
  res.status(401);
  throw new Error("Invalid admin credentials");
}

  if (!admin.isActive) {
    res.status(403);
    throw new Error("Admin account disabled");
  }

  admin.lastLogin = new Date();
  await admin.save();

  res.json({
    success: true,
    message: "Admin login successful",
    token: admin.generateToken(),
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
    },
  });
});



/* ================= MONTHLY REVENUE ================= */
export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const monthlyData = await Payment.aggregate([
    { $match: { status: "PAID" } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const formatted = monthlyData.map((d) => ({
    month: `${d._id.month}-${d._id.year}`,
    total: d.total,
  }));

  res.json({ success: true, monthlyRevenue: formatted });
});

/* ================= TOP PRODUCTS ================= */
export const getTopProducts = asyncHandler(async (req, res) => {
  const topProducts = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.productId",
        totalSold: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        name: "$product.productName",
        images: "$product.images",
        totalSold: 1,
      },
    },
  ]);

  res.json({ success: true, topProducts });
});

/* ================= ALL ORDERS ================= */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "fullName email")
    .populate("orderItems.productId", "productName price images")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Counts
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();

  // ✅ Total Revenue (PAID payments only)
  const revenueAgg = await Payment.aggregate([
    { $match: { status: "PAID" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  // ✅ SINGLE RESPONSE
  res.json({
    success: true,
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
    },
  });
});

// admin.controller.js
export const getAllSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find()
    .populate("user", "fullName email")
    .populate("product", "productName")
    .sort({ createdAt: -1 });

  res.json({ success: true, subscriptions });
});
