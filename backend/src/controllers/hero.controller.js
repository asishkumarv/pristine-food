import asyncHandler from "express-async-handler";
import HeroSlide from "../models/hero.model.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";

//
// ➕ Create slide (Admin only)
//
export const createHeroSlide = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, order } = req.body;

  if (!title || !subtitle || !buttonText) {
    return res.status(400).json({ success:false, message:"All fields required ❌" });
  }

  let imageData = {};
  if (req.file) {
    const optimized = await sharp(req.file.buffer)
      .resize(1200) // banner width
      .toFormat("webp", { quality: 80 })
      .toBuffer();

    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "ecommerce-hero-banners", resource_type: "image" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(optimized);
    });

    imageData = { public_id: uploadRes.public_id, url: uploadRes.secure_url };
  }

  const slide = await HeroSlide.create({ title, subtitle, buttonText, image: imageData, order });

  res.status(201).json({ success:true, message:"Slide added ✅", slide });
});

//
// 📦 Get slides (Public)
//
export const getHeroSlides = asyncHandler(async (req, res) => {
  const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
  res.status(200).json({ success:true, slides });
});

//
// ✏ Update slide (Admin only)
//
export const updateHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) {
    return res.status(404).json({ success:false, message:"Slide not found ❌" });
  }

  const { title, subtitle, buttonText, order, isActive } = req.body;

  let imageData = slide.image;
  if (req.file) {
    const optimized = await sharp(req.file.buffer)
      .resize(1200)
      .toFormat("webp", { quality: 80 })
      .toBuffer();

    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "ecommerce-hero-banners", resource_type: "image" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(optimized);
    });

    imageData = { public_id: uploadRes.public_id, url: uploadRes.secure_url };
  }

  slide.title = title ?? slide.title;
  slide.subtitle = subtitle ?? slide.subtitle;
  slide.buttonText = buttonText ?? slide.buttonText;
  slide.order = order ?? slide.order;
  slide.image = imageData;
  slide.isActive = isActive ?? slide.isActive;

  if (isActive === false) slide.isActive = false;

  await slide.save();

  res.status(200).json({ success:true, message:"Slide updated ✅", slide });
});

//
// ❌ Delete slide (Admin only)
//
export const deleteHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) return res.status(404).json({ success:false, message:"Slide not found ❌" });

  await slide.deleteOne();
  res.status(200).json({ success:true, message:"Slide removed ✅" });
});
