import multer from "multer";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

/* ================= MULTER MEMORY ================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ================= UPLOAD LOGO ================= */
export const uploadLogoToCloudinary = async (buffer) => {
  const optimized = await sharp(buffer)
    .resize(500)
    .toFormat("webp", { quality: 80 })
    .toBuffer();

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce-settings-logo",
        resource_type: "image",
      },
      (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }
    ).end(optimized);
  });

  return {
    public_id: result.public_id,
    url: result.secure_url,
  };
};

export default upload;
