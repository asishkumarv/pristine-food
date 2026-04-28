import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/* ================= MULTER SETUP ================= */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

/* ================= IMAGE UPLOAD ================= */
export const uploadToCloudinary = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
            secure_url: result.secure_url,
          });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* ================= MULTIPLE IMAGES ================= */
export const uploadMultipleToCloudinary = async (
  files,
  folder = "products"
) => {
  const uploadedImages = [];

  for (const file of files) {
    if (!file?.buffer) continue;

    const uploaded = await uploadToCloudinary(file.buffer, folder);
    uploadedImages.push(uploaded);
  }

  return uploadedImages;
};

export const uploadVideoToCloudinary = (buffer, folder = "videos") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
        timeout: 120000,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          public_id: result.public_id,
          url: result.secure_url,
          duration: result.duration,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};