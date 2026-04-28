import mongoose from "mongoose";

/* ================= VARIANT SCHEMA ================= */
const variantSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true },
  },
  { _id: false }
);

/* ================= REVIEW SCHEMA ================= */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);


/* ================= PRODUCT SCHEMA ================= */
const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    shortDescription: { type: String },
    description: { type: String, required: true },

    brand: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    variants: {
      type: [variantSchema],
      validate: [(v) => v.length > 0, "At least one variant required"],
    },

    isOrganic: { type: Boolean, default: false },
    coldPressed: { type: Boolean, default: false },

    ingredients: [String],
    shelfLife: String,
    expiryDate: Date,
    storageInstructions: String,
    madeIn: String,

    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },

    reviews: [reviewSchema],
    isSubscribable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
