/**
 * 🧪 Tests de Integración: /api/users
 *
 * Testea el flujo completo: Request → Routes → Controller → Service → Repository → DB
 *
 * IMPORTANTE: El middleware de autenticación (passportCall) se aplica en routes/index.js
 * a nivel de prefijo: router.use("/users", passportCall("jwt"), user)
 * Esto significa que TODAS las rutas bajo /api/users requieren JWT válido.
 *
 * Ruta testeada: GET /api/users/current
 * Retorna los datos del usuario autenticado via UserDto (sin password, resetToken)
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../src/app.js";
import { UserModel } from "../../../src/daos/models/user.js";
import CartModel from "../../../src/daos/models/cart.js";

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================

describe("Users Endpoints - Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }
  });

  afterAll(async () => {
    try {
      await UserModel.deleteMany({});
      await CartModel.deleteMany({});
    } catch (error) {
      // Ignorar errores al limpiar
    }
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await CartModel.deleteMany({});
  });

  // ==========================================================================
  // HELPER
  // ==========================================================================

  /**
   * Registra un usuario y hace login.
   * Retorna: { cookie, userData } para usar en assertions
   */
  const registerAndLogin = async () => {
    const userData = {
      first_name: "Thomas",
      last_name: "Brets",
      email: "thomas@test.com",
      password: "password123",
      age: 25,
    };

    await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    return {
      cookie: loginResponse.headers["set-cookie"],
      userData,
    };
  };

  // ============================================================================
  // TESTS: GET /api/users/current
  // ============================================================================

  describe("GET /api/users/current", () => {
    test("✅ should return current user data when authenticated", async () => {
      // Arrange: Registrar y loguear
      const { cookie, userData } = await registerAndLogin();

      // Act
      const response = await request(app)
        .get("/api/users/current")
        .set("Cookie", cookie)
        .expect(200);

      // Assert: Verificar campos del usuario
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.body).toHaveProperty("first_name", userData.first_name);
      expect(response.body).toHaveProperty("last_name", userData.last_name);
      expect(response.body).toHaveProperty("age", userData.age);
      expect(response.body).toHaveProperty("role");
      expect(response.body).toHaveProperty("cart");
      expect(response.body).toHaveProperty("_id");

      // Assert: Verificar que NO se exponen campos sensibles (UserDto los filtra)
      expect(response.body).not.toHaveProperty("password");
      expect(response.body).not.toHaveProperty("resetToken");
      expect(response.body).not.toHaveProperty("resetTokenExp");
    });

    test("❌ should return 401 when no authentication cookie is provided", async () => {
      // Act: Request sin cookie
      const response = await request(app)
        .get("/api/users/current")
        .expect(401);

      // Assert: Verificar que retorna error de autenticación
      // passportCall retorna { error: "..." } cuando no hay token
      expect(response.body).toHaveProperty("error");
    });

    test("❌ should return 401 when cookie contains an invalid JWT", async () => {
      // Act: Enviar una cookie con JWT inventado (no firmado con el JWT_SECRET real)
      const response = await request(app)
        .get("/api/users/current")
        .set("Cookie", ["accessToken=este.jwt.invalido"])
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty("error");
    });
  });

}); // Fin describe Users Endpoints

// ============================================================================
// 📚 Conceptos clave de este archivo
// ============================================================================

/**
 * DÓNDE SE APLICA LA AUTENTICACIÓN:
 * - En routes/index.js: router.use("/users", passportCall("jwt"), user)
 * - El middleware corre ANTES de entrar a user.js
 * - Si falla → 401 con { error: "..." } (sin pasar por el errorHandler)
 * - Si pasa → req.user queda seteado con los datos del JWT
 *
 * UserDto - CAMPOS QUE RETORNA:
 * ✅ _id, first_name, last_name, email, age, role, cart
 * ❌ password, resetToken, resetTokenExp (filtrados por seguridad)
 *
 * COOKIE INVÁLIDA vs SIN COOKIE:
 * - Sin cookie → passport no encuentra token → 401
 * - Cookie con JWT inválido → passport no puede verificar firma → 401
 * - Ambos casos retornan { error: "..." } desde passportCall
 */
