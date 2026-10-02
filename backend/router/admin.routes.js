import { adminController } from "../controllers/admin.controller.js";
import express from "express";
import { verifyJwt, verifyAdmin } from "../middlewares/auth.middleware.js";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/users", verifyJwt, verifyAdmin, adminController.getAllUsers);

export { router };
