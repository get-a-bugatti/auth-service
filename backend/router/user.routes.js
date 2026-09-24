import { userController } from "../controllers/user.controller.js";
import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyJwt, userController.me);

export { router };
