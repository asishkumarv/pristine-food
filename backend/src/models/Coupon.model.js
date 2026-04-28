import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["PERCENT", "FLAT"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },

    minCartValue: {
      type: Number,
      default: 0,
    },

    maxDiscount: {
      type: Number, // only for percentage coupons
    },

    expiry: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
