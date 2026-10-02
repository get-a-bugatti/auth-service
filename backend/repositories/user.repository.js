import { User } from "../models/user.model.js";

class UserRepository {
  async findAllUsers({ limit, cursor }) {
    const query = {};

    if (cursor) {
      query.username = { $gt: cursor };
    }

    let dbQuery = User.find(query).sort({ username: 1 }).lean();
    if (limit) {
      dbQuery = dbQuery.limit(limit);
    }

    const response = await dbQuery;

    return response;
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByGoogleAccount({
    googleId, email
  }) {
    return await User.findOne(
      {
        googleId: googleId,
        email: email.trim().toLowerCase()
      }
    );
  }

  async findByEmailOrUsername({ loginCredential, projections = "" }) {
    const credential = loginCredential.trim();
    if (!projections) {
      return await User.findOne({
        $or: [{ email: credential }, { username: credential }],
      });
    }
    return await User.findOne({
      $or: [{ email: credential }, { username: credential }],
    }).select(projections);
  }

    async existsByEmail({ loginCredential, projections = "" }) {

    return await User.findOne({
      email: email.trim().toLowerCase()
    });
  }

  async existsByEmailOrUsername({ email, username }) {
    const user = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: username.trim().toLowerCase() },
      ],
    });
    return !!user; // Returns a true/false boolean explicitly
  }

  async createUser({userData, mode}) {
    let userObject;

    if (mode === "local") {
      userObject = {
        email: userData.email?.trim().toLowerCase(),
        username: userData.username?.trim().toLowerCase(),
        fullname: userData.fullname?.trim(),
        password: userData.password?.trim(),
      }
    } 
    
    if (mode === "google") {
      userObject = {
        googleId: userData.googleId,
        authProvider: userData.authProvider,
        email: userData.email?.trim().toLowerCase(),
        username: userData.username?.trim().toLowerCase(),
        fullname: userData.fullname?.trim(),
      };
    }

    return await User.create(userObject);
  }
}

export const userRepository = new UserRepository();
