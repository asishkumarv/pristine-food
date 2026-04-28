import multer from "multer";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

const upload = multer({ storage: multer.memoryStorage() });

// Upload & compress before Cloudinary
export const uploadCategoryImage = async (buffer, filename) => {
  const optimized = await sharp(buffer)
    .resize(700)
    .toFormat("webp", { quality: 75 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "ecommerce-categories", public_id: filename.split(".")[0] },
      (err, result) => {
        if (err) reject(err);
        else resolve({ public_id: result.public_id, secure_url: result.secure_url });
      }
    ).end(optimized);
  });
};

export default upload;
