import express, { Router } from "express";
const router = Router();

import cart from "./cart.js";
import { UserDto } from "../dtos/user.dto.js"; // Actualizado al nuevo DTO
import product from "./product.js";
import { authRepository } from "../repositories/authRepository.js";

/**
 * @swagger
 * /api/users/current:
 *   get:
 *     summary: Obtener usuario actual autenticado
 *     description: Retorna los datos del usuario autenticado. La password y tokens sensibles son filtrados por el UserDto.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual (sin password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 role:
 *                   type: string
 *                   enum: [user, admin]
 *                 cart:
 *                   type: string
 *                   description: ID del carrito asociado
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               email: "user@example.com"
 *               first_name: "John"
 *               last_name: "Doe"
 *               age: 25
 *               role: "user"
 *               cart: "507f1f77bcf86cd799439012"
 *       401:
 *         description: No autenticado (falta cookie accessToken)
 *         content:
 *           application/json:
 *             example:
 *               error: "Error: No auth token"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: "usuario no encontrado"
 */
router.get("/current", async (req, res) => {
  try {
    const user = await authRepository.getUserByEmail(req.user.email);
    if (!user)
      return res.status(404).json({ message: "usuario no encontrado" });

    const safeUser = new UserDto(user);
    res.json(safeUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "error al obtener el usuario actual", error });
  }
});



//! Cart
router.use("/carts", cart);

export default router;
