import { userRepository } from "../repositories/user.repository.js";

class AdminService {
  async getAllUsers({ limit, cursor }) {
    return await userRepository.findAllUsers({ limit, cursor });
  }
}

export const adminService = new AdminService();
