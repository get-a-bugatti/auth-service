import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";

class UserService {
  async generateTokens(userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new AppError(404, "User not found.");
      }

      const [accessToken, refreshToken] = await Promise.all([
        user.generateAccessToken(),
        user.generateRefreshToken(),
      ]);

      if (!accessToken || !refreshToken) {
        throw new AppError(500, "Could not generate tokens.");
      }

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generating tokens:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, "Error generating tokens");
    }
  }

  async getMe({ accessToken }) {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await userRepository.findById(decoded.id);

    return user.toObject();
  }
}

export const userService = new UserService();
