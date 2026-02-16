import express, { Router } from "express";
import { authController } from "../controllers/authController.js";
const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea un nuevo usuario en el sistema, genera un carrito asociado y hashea la contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *               - age
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario (debe ser único)
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña (mínimo 6 caracteres)
 *               first_name:
 *                 type: string
 *                 description: Nombre del usuario
 *               last_name:
 *                 type: string
 *                 description: Apellido del usuario
 *               age:
 *                 type: integer
 *                 minimum: 1
 *                 description: Edad del usuario
 *           example:
 *             email: "usuario@ejemplo.com"
 *             password: "password123"
 *             first_name: "Juan"
 *             last_name: "Pérez"
 *             age: 25
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID del usuario
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 cart:
 *                   type: string
 *                   description: ID del carrito asociado
 *                 role:
 *                   type: string
 *                   description: Rol del usuario (user/admin)
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               email: "usuario@ejemplo.com"
 *               first_name: "Juan"
 *               last_name: "Pérez"
 *               age: 25
 *               cart: "507f1f77bcf86cd799439012"
 *               role: "user"
 *       400:
 *         description: Email ya existe, datos inválidos o contraseña muy corta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               emailExists:
 *                 value:
 *                   message: "Usuario ya existe"
 *               shortPassword:
 *                 value:
 *                   message: "La contraseña debe tener al menos 6 caracteres"
 *               invalidData:
 *                 value:
 *                   message: "Datos inválidos"
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y establece una cookie HTTP-only con el JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *           example:
 *             email: "usuario@ejemplo.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         headers:
 *           Set-Cookie:
 *             description: Cookie HTTP-only que contiene el JWT (accessToken)
 *             schema:
 *               type: string
 *               example: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=None
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "login success"
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Credenciales incorrectas"
 *       400:
 *         description: Datos faltantes o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Elimina la cookie de autenticación (JWT) del cliente
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         headers:
 *           Set-Cookie:
 *             description: Cookie accessToken eliminada (Max-Age=0)
 *             schema:
 *               type: string
 *               example: accessToken=; Max-Age=0; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Sesión cerrada correctamente"
 */
router.post("/logout", authController.logout);

export default router;
