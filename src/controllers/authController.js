import { authService } from "../services/authService.js";
import { UserDto } from "../dtos/user.dto.js";

class AuthController {
  constructor(services) {
    this.services = services;
  }

  register = async (req, res, next) => {
    try {
      const resp = await this.services.register(req.body);
      // Usar DTO para filtrar datos sensibles (password, resetToken, etc.)
      const userDto = new UserDto(resp);
      res.status(201).json(userDto);
    } catch (error) {
      next(error);
    }
  };

  
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await this.services.login(email, password);
      const token = this.services.generateToken(user);
      res
        .cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
        .json({
          message: "login success",
        });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.status(200).json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController(authService);
