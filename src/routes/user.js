import express, { Router } from "express";
const router = Router();

import cart from "./cart.js";
import { UserDto } from "../dtos/user.dto.js"; // Actualizado al nuevo DTO
import product from "./product.js";
import { authRepository } from "../repositories/authRepository.js";

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
