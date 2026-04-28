import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler.js";

// ✅ Import Routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import orderRoutes from "./routes/order.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import contactRoutes from "./routes/contact.routes.js";


dotenv.config();

const app = express();

// ✅ Middlewares
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.ADMIN_FRONTED_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "https://pristine-food-admin.web.app",
      "https://pristine-food-frontend.web.app",
      "https://pristineorganic.shop",
      "https://admin.pristineorganic.shop",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/contact", contactRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

// ✅ Global Error Handler
app.use(errorHandler);

export default app;
