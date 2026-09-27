import express from "express";
import passport from "passport";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();



router.get(
  "/google", (req, res, next) => {

    const intent = req.query.intent === "signup" ? "google-signup" : "google-login";

    req.session.oauthStrategy = intent;

    passport.authenticate(intent, { scope: ["email", "profile"] })(req, res, next);
  }
);

// const errorsMap = {
//   "email_not_found": "No email associated with this google account.",
//   "user_exists_local": "User already exists in local.",
//   "account_not_found": "No account found associated with this Google email."
// }

router.get(
  "/google/callback",
  (req, res, next) => {
    const strategyName = req.session.oauthStrategy || "google-login";
    
    passport.authenticate(strategyName, (err, user, info) => {
      if (err) return next(err);
      
      if (!user) { 
        return res.redirect(`${process.env.FRONTEND_URL}/signup?error=${encodeURIComponent(info?.name)}`);
      }

      // WAS HERE , yesterday night. Setting htis up is next.

    })(req, res, next);
  }
);

router.post("/signup", authController.register);
router.post("/login", authController.login);

router.post("/token", authController.refresh);

export { router };
