import { authRepository } from "../repositories/authRepository.js";
import { UserDto } from "../dtos/user.dto.js";

class AdminController {
  // GET /api/admin/users — lista todos los usuarios (sin datos sensibles)
  getUsers = async (req, res, next) => {
    try {
      const users = await authRepository.getAll();
      const usersDto = users.map((u) => new UserDto(u));
      res.json(usersDto);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/admin/users/:uid — elimina un usuario por ID
  deleteUser = async (req, res, next) => {
    try {
      const { uid } = req.params;
      const deleted = await authRepository.deleteById(uid);
      if (!deleted)
        return res.status(404).json({ error: "Usuario no encontrado" });
      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
