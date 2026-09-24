import { ApiResponse } from "../utils/ApiResponse.js";
import { userService } from "../services/user.service.js";

class UserController {
  me = async (req, res) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new AppError(401, "Access denied. Missing token.");
    }

    const result = await userService.getMe({ accessToken });

    return res.status(200).json(new ApiResponse(200, "User fetched", result));
  };
}

export const userController = new UserController();
