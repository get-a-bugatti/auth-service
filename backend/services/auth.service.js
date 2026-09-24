import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

class AuthService {
  async loginUser({ login, password }) {
    if (!login || !password || !login.trim() || !password.trim()) {
      throw new ApiError(400, "All fields are required.");
    }

    const user = await userRepository.findByEmailOrUsername({
      loginCredential: login,
      projections: "+password",
    });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    console.log("password being checked :", password);

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Incorrect password.");
    }

    return await this.generateTokens(user._id);
  }

  async registerUser({ email, username, fullname, password }) {
    if (
      [email, username, fullname, password].some(
        (el) => !el || !el.trim() || el.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required.");
    }

    const userExists = await userRepository.existsByEmailOrUsername({
      email,
      username,
    });

    if (userExists) {
      throw new ApiError(400, "User already exists.");
    }

    const newUser = await userRepository.createUser({
      email,
      username,
      fullname,
      password,
    });

    return { id: newUser._id };
  }

  async refreshTokens(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Access denied. Missing token.");
    }

    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(403).clearCookie("accessToken").json({});
    }

    const user = await userRepository.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, "Access denied. User no longer exists.");
    }

    return await this.generateTokens(user._id);
  }
}

export const authService = new AuthService();
