import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { uploadMultipleToCloudinary } from "../middleware/upload.middleware.js";

/* ======================================================
   CREATE PRODUCT (ADMIN)
====================================================== */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    shortDescription,
    description,
    brand,
    category,
    variants,
    isOrganic,
    coldPressed,
    ingredients,
    shelfLife,
    expiryDate,
    storageInstructions,
    madeIn,
    isFeatured,
    isBestSeller,
    isSubscribable,
  } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error("Invalid category");
  }

  let images = [];
  if (req.files?.length > 0) {
    images = await uploadMultipleToCloudinary(req.files, "products");
  }

  const product = await Product.create({
    productName,
    shortDescription,
    description,
    brand,
    category,
    variants: JSON.parse(variants),
    isOrganic,
    coldPressed,
    ingredients: ingredients ? JSON.parse(ingredients) : [],
    shelfLife,
    expiryDate,
    storageInstructions,
    madeIn,
    isFeatured,
    isBestSeller,
    isSubscribable,
    images,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

/* ======================================================
   GET ALL PRODUCTS (PUBLIC)
====================================================== */
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate("category", "title slug")
    .sort({ createdAt: -1 });

  res.json({ success: true, products });
});

/* ======================================================
   GET PRODUCT BY ID (PUBLIC)
====================================================== */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "title slug"
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

/* ======================================================
   UPDATE PRODUCT (ADMIN)
====================================================== */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updates = req.body;

  // Handle variants / ingredients JSON
  if (updates.variants) updates.variants = JSON.parse(updates.variants);
  if (updates.ingredients)
    updates.ingredients = JSON.parse(updates.ingredients);

  // Upload new images if provided
  if (req.files?.length > 0) {
    const newImages = await uploadMultipleToCloudinary(req.files, "products");
    product.images = newImages; // replace images
  }

  Object.assign(product, updates);
  await product.save();

  res.json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

/* ======================================================
   DELETE PRODUCT (ADMIN – SOFT DELETE)
====================================================== */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();

  res.json({
    success: true,
    message: "Product deleted (soft delete",
  });
});

/* ======================================================
   TOGGLE FEATURED / BEST SELLER (ADMIN)
====================================================== */
export const toggleProductFlags = asyncHandler(async (req, res) => {
  const { isFeatured, isBestSeller } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (typeof isFeatured === "boolean") product.isFeatured = isFeatured;
  if (typeof isBestSeller === "boolean") product.isBestSeller = isBestSeller;

  await product.save();

  res.json({
    success: true,
    product,
  });
});

/* ======================================================
   ADD REVIEW (USER)
====================================================== */
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user?.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.fullName,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numOfReviews = product.reviews.length;

  product.ratings =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: "Review added",
  });
});
