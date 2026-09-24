import express from "express";
import passport from "passport";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_URL}/`,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_login_failed`,
  })
);

router.post("/signup", authController.register);
router.post("/login", authController.login);

router.post("/token", authController.refresh);

export { router };
