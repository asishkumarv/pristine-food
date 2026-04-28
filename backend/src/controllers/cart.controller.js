import asyncHandler from "express-async-handler";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

/* ================= GET CART ================= */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: "items.product",
      select: "productName variants images category",
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({
    success: true,
    cart,
  });
});

/* ================= ADD TO CART ================= */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantSku, quantity = 1 } = req.body;

  if (!productId || !variantSku) {
    res.status(400);
    throw new Error("Product ID and variant SKU are required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const variant = product.variants.find(
    (v) => v.sku === variantSku.trim()
  );

  if (!variant) {
    res.status(400);
    throw new Error("Variant not found");
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  if (variant.stock < quantity) {
    res.status(400);
    throw new Error("Insufficient stock");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.variantSku === variantSku
  );

  if (existingItem) {
    existingItem.quantity = Math.min(
      existingItem.quantity + quantity,
      variant.stock
    );
  } else {
    cart.items.push({
      product: productId,
      variantSku,
      quantity,
    });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart,
  });
});

/* ================= UPDATE CART ITEM ================= */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { variantSku, quantity } = req.body;

  if (!variantSku || quantity === undefined) {
    res.status(400);
    throw new Error("Variant SKU and quantity are required");
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (i) => i.variantSku === variantSku
  );

  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  // 🔍 Check stock again
  const product = await Product.findById(item.product);
  const variant = product.variants.find(
    (v) => v.sku === variantSku
  );

  if (!variant) {
    res.status(400);
    throw new Error("Variant not found");
  }

  if (quantity > variant.stock) {
    res.status(400);
    throw new Error("Insufficient stock");
  }

  item.quantity = quantity;
  await cart.save();

  res.json({ success: true, cart });
});

/* ================= REMOVE CART ITEM ================= */
export const removeCartItem = asyncHandler(async (req, res) => {
  const { variantSku } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const initialLength = cart.items.length;

  cart.items = cart.items.filter(
    (item) => item.variantSku !== variantSku
  );

  if (cart.items.length === initialLength) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  await cart.save();

  res.json({ success: true, cart });
});

/* ================= CLEAR CART ================= */
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] }
  );

  res.json({ success: true, message: "Cart cleared" });
});
