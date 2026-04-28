import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= ADDRESS SUB-SCHEMA ================= */
const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },

    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ================= USER SCHEMA ================= */
const userSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 never send password
    },

    /* PROFILE */
    avatar: {
      public_id: { type: String },
      url: {
        type: String,
        default: "https://ik.imagekit.io/izqq5ffwt/user-profile-pic.jpg",
      },
    },

    /* ROLE & STATUS */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ADDRESSES */
    addresses: [addressSchema],

    /* AUTH TRACKING */
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ================= PASSWORD HASH ================= */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ================= METHODS ================= */
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

const User = mongoose.model("User", userSchema);
export default User;
