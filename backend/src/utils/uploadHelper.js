import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ Cloudinary configuration (ensure this is also set up in src/config/cloudinary.js)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//
// 📤 Upload single image buffer
//
export const uploadBuffer = async (fileBuffer, folder = "hungerbites") => {
  try {
    const base64String = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

    const result = await cloudinary.v2.uploader.upload(base64String, {
      folder,
      resource_type: "image",
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("Image upload failed. Please try again.");
  }
};

//
// 📤 Upload multiple image buffers
//
export const uploadMultipleBuffers = async (files, folder = "hungerbites/products") => {
  try {
    const uploads = files.map((file) =>
      uploadBuffer(file.buffer, folder)
    );
    const results = await Promise.all(uploads);
    return results; // array of { public_id, url }
  } catch (error) {
    console.error("❌ Multiple Upload Error:", error);
    throw new Error("Multiple image upload failed.");
  }
};

//
// 🗑️ Delete image from Cloudinary
//
export const deleteImage = async (public_id) => {
  try {
    await cloudinary.v2.uploader.destroy(public_id);
    return true;
  } catch (error) {
    console.error("❌ Delete Image Error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};
