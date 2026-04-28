import asyncHandler from "express-async-handler";
import Video from "../models/video.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadVideoToCloudinary } from "../middleware/upload.middleware.js";

/* ================= CREATE VIDEO ================= */
export const createVideo = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    res.status(400);
    throw new Error("Video file is missing");
  }

  const uploaded = await uploadVideoToCloudinary(
    req.file.buffer,
    "instagram-videos"
  );

  const video = await Video.create({
    title: req.body.title,
    video: uploaded,
  });

  res.status(201).json({
    success: true,
    video,
  });
});

/* ================= GET PUBLIC VIDEOS ================= */
export const getVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ isActive: true }).sort({ createdAt: -1 });

  res.json({
    success: true,
    videos,
  });
});

/* ================= UPDATE VIDEO ================= */
export const updateVideo = asyncHandler(async (req, res) => {
  const { title, isActive } = req.body;

  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  if (title !== undefined) video.title = title;
  if (isActive !== undefined) video.isActive = isActive;

  await video.save();

  res.json({
    success: true,
    video,
  });
});

/* ================= DELETE VIDEO ================= */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }

  await cloudinary.uploader.destroy(video.video.public_id, {
    resource_type: "video",
  });

  await video.deleteOne();

  res.json({
    success: true,
    message: "Video deleted successfully",
  });
});
