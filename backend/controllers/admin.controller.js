import { adminService } from "../services/admin.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class AdminController {
  async getAllUsers(req, res) {
    const { limit = 10, cursor = null } = req.query;

    const users = await adminService.getAllUsers({ limit, cursor });

    return res
      .status(200)
      .json(new ApiResponse(200, "Users fetched successfully.", users));
  }
}

export const adminController = new AdminController();
