import express from "express";
import passport from "passport";
import { authController } from "../controllers/auth.controller.js";
import {
  generateOauthState,
  verifyOauthState,
} from "../utils/OauthStateHandler.js";
import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = express.Router();

router.get("/google", (req, res, next) => {
  const intent =
    req.query.intent === "signup" ? "google-signup" : "google-login";

  const state = generateOauthState(intent);

  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 min
  });

  passport.authenticate(intent, { scope: ["email", "profile"] })(
    req,
    res,
    next,
  );
});

router.get("/google/callback", (req, res, next) => {
  console.log("Oauth state cookie", req.cookies.oauth_state);
  const { intent: strategyName } = verifyOauthState(req.cookies.oauth_state);
  console.log("Session Oauth Strategy is : ", strategyName);

  passport.authenticate(strategyName, async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.clearCookie("oauth_state");
      return res.redirect(
        `${process.env.FRONTEND_URL}/${info?.redirectPage}?error=${encodeURIComponent(info?.name)}`,
      );
    }

    res.clearCookie("oauth_state");

    // JWT lOGIC HERE.
    const { accessToken, refreshToken } = await authService.generateTokens(
      user._id,
    );
    const cookieOptions = {
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
    };

    if (!accessToken || !refreshToken) {
      throw new Error("Couldn't genereate JWT tokens in the Oauth flow.");
    }

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .redirect(`${process.env.FRONTEND_URL}/users`);
  })(req, res, next);
});

router.post("/signup", authController.register);
router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.post("/token", authController.refresh);

export { router };
