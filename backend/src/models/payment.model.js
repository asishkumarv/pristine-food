import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 🔹 OPTIONAL references
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },

    paymentType: {
      type: String,
      enum: ["ORDER", "SUBSCRIPTION"],
      required: true,
    },

    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    amount: Number,
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED"],
      default: "CREATED",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Payment", paymentSchema);
