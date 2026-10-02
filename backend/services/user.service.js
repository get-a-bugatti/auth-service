import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";

class UserService {


  async getMe({ accessToken }) {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await userRepository.findById(decoded.id);

    return user.toObject();
  }
}

export const userService = new UserService();
