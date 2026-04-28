import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Admin not authorized");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      res.status(403);
      throw new Error("Admins only");
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      res.status(403);
      throw new Error("Admin access denied");
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};
