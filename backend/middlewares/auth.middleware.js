import { AppError } from "../utils/AppError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJwt = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw new AppError(401, "Access denied. Missing token.");
  }

  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.error("JWT Verification Error :", error);
    throw new AppError(401, `Access Token expired or invalid.`);
  }

  if (!decoded) {
    throw new AppError(401, "Access denied. Invalid or expired token");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError(401, "Access denied. User no longer exists.");
  }

  req.user = user.toObject();
  next();
};

export const verifyAdmin = async (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    throw new AppError(403, "Access denied. User is not an admin.");
  }
};
