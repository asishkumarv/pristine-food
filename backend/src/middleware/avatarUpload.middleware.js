import multer from "multer";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadAvatarToCloudinary = async (buffer) => {
  const optimized = await sharp(buffer)
    .resize(300, 300)
    .toFormat("webp", { quality: 80 })
    .toBuffer();

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "user-avatars",
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
