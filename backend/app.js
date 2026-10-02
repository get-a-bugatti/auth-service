import express from "express";
import path from "path";
import { router as userRouter } from "./router/user.routes.js";
import { router as adminRouter } from "./router/admin.routes.js";
import { router as authRouter } from "./router/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session"
import passport from "passport";
import "./config/passport.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(cookieParser());

app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(
   session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, //24h
        },
    })
)

app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ limit: "16mb", extended: true }));

app.use(passport.initialize());
app.use(passport.authenticate('session'));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/auth", authRouter);

app.use((err, req, res, next) => {
  const status = parseInt(err.statusCode) || 500;
  const message = err.message || "Something went wrong";

  console.error("Global Error : ", err);

  res.status(status).json({
    success: false,
    message: message,
    status: status,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };
