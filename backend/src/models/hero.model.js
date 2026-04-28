import mongoose from "mongoose";

const heroImageSchema = new mongoose.Schema({
  public_id: String,
  url: String,
}, { _id: false });

const heroSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true },
    buttonText: { type: String, required: true },
    image: heroImageSchema,  // Cloudinary banner URL
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // for slide sequence
  },
  { timestamps: true }
);

const HeroSlide = mongoose.model("HeroSlide", heroSchema);
export default HeroSlide;
