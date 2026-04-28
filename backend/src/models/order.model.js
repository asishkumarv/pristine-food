import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantSku: String,
        quantity: Number,
        price: Number,
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    coupon: {
      code: String,
      discount: Number,
    },

    priceSummary: {
      subtotal: Number,
      discount: Number,
      total: Number,
    },

    status: {
      type: String,
      enum: ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

/* ✅ SAFE ORDER ID GENERATION */
orderSchema.pre("validate", function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
