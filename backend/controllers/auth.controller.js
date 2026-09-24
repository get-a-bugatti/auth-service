class AuthController {
  #cookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
  };
  // Using arrow functions eliminates any need for .bind(this) in the constructor
  login = async (req, res) => {
    const { login, password } = req.body;

    const { accessToken, refreshToken } = await authService.loginUser({
      login,
      password,
    });

    return res
      .status(200)
      .cookie("accessToken", accessToken, this.#cookieOptions)
      .cookie("refreshToken", refreshToken, this.#cookieOptions)
      .json(new ApiResponse(200, "User logged in successfully"));
  };

  register = async (req, res) => {
    const { email, username, fullname, password } = req.body;

    const result = await authService.registerUser({
      email,
      username,
      fullname,
      password,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "New User created successfully.", result));
  };

  refresh = async (req, res) => {
    const { refreshToken: incomingRefreshToken } = req.cookies;

    const { accessToken, refreshToken } = await authService.refreshTokens(
      incomingRefreshToken
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, this.#cookieOptions)
      .cookie("refreshToken", refreshToken, this.#cookieOptions)
      .json(new ApiResponse(200, "Refreshed Tokens successfully."));
  };
}

export const authController = new AuthController();
