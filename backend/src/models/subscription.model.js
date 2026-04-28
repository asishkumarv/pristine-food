import mongoose from "mongoose";

export const SUBSCRIPTION_FREQUENCIES = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
};

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantSku: { type: String, required: true },

    quantityPerDay: { type: Number, default: 1 },

    frequency: {
      type: String,
      enum: Object.values(SUBSCRIPTION_FREQUENCIES),
      default: SUBSCRIPTION_FREQUENCIES.DAILY,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    totalAmount: { type: Number, required: true },

    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
    },

    addressId: { type: mongoose.Schema.Types.ObjectId, required: true },

    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Subscription", subscriptionSchema);
