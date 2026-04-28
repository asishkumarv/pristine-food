import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";
import slugify from "slugify";

/* ================= CREATE CATEGORY (ADMIN) ================= */
export const createCategory = asyncHandler(async (req, res) => {
  const { title, description, highlights } = req.body;

  const exists = await Category.findOne({ title });
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  let image = null;

  if (req.file) {
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      "categories"
    );

    image = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  const category = await Category.create({
    title,
    slug: slugify(title, { lower: true }),
    description,
    highlights: highlights ? JSON.parse(highlights) : [],
    image,
  });

  res.status(201).json({
    success: true,
    category,
  });
});

/* ================= GET ALL CATEGORIES ================= */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    categories,
  });
});

/* ================= GET ACTIVE CATEGORIES ================= */
export const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true });

  res.status(200).json({
    success: true,
    categories,
  });
});

/* ================= UPDATE CATEGORY (ADMIN) ================= */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const { title, description, highlights, isActive } = req.body;

  if (title) {
    category.title = title;
    category.slug = slugify(title, { lower: true });
  }

  if (description) category.description = description;
  if (typeof isActive !== "undefined") category.isActive = isActive;

  if (highlights) {
    category.highlights = JSON.parse(highlights);
  }

  if (req.file) {
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      "categories"
    );

    category.image = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  await category.save();

  res.status(200).json({
    success: true,
    category,
  });
});

/* ================= DELETE CATEGORY (ADMIN) ================= */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted",
  });
});
