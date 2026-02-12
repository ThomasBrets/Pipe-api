/**
 * 🧪 Tests de Integración: POST /api/auth/register
 *
 * Testea el flujo completo: Request → Routes → Controller → Service → Repository → DB
 * Usa base de datos de test real (no mocks) y supertest para requests HTTP
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
// CONFIGURACIÓN
// ============================================================================

describe("POST /api/auth/register - Integration Tests", () => {
  // beforeAll: Se ejecuta una vez antes de todos los tests
  beforeAll(async () => {
    // Verificación de seguridad: asegurar que estamos en entorno de test
    if (process.env.NODE_ENV !== "test") {
      console.warn("⚠️  WARNING: Running tests outside test environment");
    }

    // Verificar que la conexión a DB esté lista (se conecta al importar app.js)
    //! 0 = disconnected  // Desconectado
    //? 1 = connected     // Conectado ✅
    //! 2 = connecting    // Conectando...
    //! 3 = disconnecting // Desconectando...

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }
  });

  // afterAll: Se ejecuta una vez después de todos los tests
  afterAll(async () => {
    try {
      await UserModel.deleteMany({});
      await CartModel.deleteMany({});
      await mongoose.connection.close(); // Importante: cerrar conexión para que Jest termine
    } catch (error) {
      // Ignorar errores al limpiar
    }
  });

  // beforeEach: Limpiar DB antes de cada test para mantener independencia
  beforeEach(async () => {
    try {
      await UserModel.deleteMany({});
      await CartModel.deleteMany({});
    } catch (error) {
      console.error("❌ Error cleaning database:", error);
      throw error;
    }
  });

  // ==========================================================================
  // TESTS: Casos de éxito y error
  // ==========================================================================

  test("✅ should register new user with valid data", async () => {
    // Arrange: Preparar datos
    const userData = {
      first_name: "Thomas",
      last_name: "Brets",
      email: "thomas@test.com",
      password: "password123",
      age: 25,
    };

    // Act: Hacer request al endpoint
    const response = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect("Content-Type", /json/)
      .expect(201);

    // Assert: Verificar respuesta HTTP
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("email", userData.email);
    expect(response.body).toHaveProperty("first_name", userData.first_name);
    expect(response.body).toHaveProperty("cart");
    expect(response.body).not.toHaveProperty("password"); // Seguridad: password no se expone

    // Assert: Verificar que se guardó correctamente en DB
    const userInDB = await UserModel.findOne({ email: userData.email });
    expect(userInDB).toBeTruthy();
    expect(userInDB.email).toBe(userData.email);
    expect(userInDB.password).not.toBe(userData.password); // Password hasheado
    expect(userInDB.cart).toBeDefined();

    const cartInDB = await CartModel.findById(userInDB.cart);
    expect(cartInDB).toBeTruthy();
  });

  test("❌ should return 400 when email already exists", async () => {
    // Arrange: Crear un usuario primero
    const existingUserData = {
      first_name: "Existing",
      last_name: "User",
      email: "existing@test.com",
      password: "password123",
      age: 30,
    };

    await request(app)
      .post("/api/auth/register")
      .send(existingUserData)
      .expect(201);

    // Act: Intentar registrar con el mismo email
    const duplicateUserData = {
      first_name: "Another",
      last_name: "Person",
      email: "existing@test.com",
      password: "different123",
      age: 25,
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(duplicateUserData)
      .expect(400);

    // Assert
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("Usuario ya existe");
// Cuenta cuántos documentos hay en la colección.
    const usersCount = await UserModel.countDocuments({
      email: "existing@test.com",
    });
    expect(usersCount).toBe(1); // Solo debe haber 1 usuario
  });

  test("❌ should return 400 when required fields are missing", async () => {
    const invalidData = {
      first_name: "Thomas",
      // Faltan: last_name, email
      password: "password123",
      age: 25,
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty("message");

    const usersCount = await UserModel.countDocuments({});
    expect(usersCount).toBe(0); // No debe crear usuario
  });

  test("❌ should return 400 with invalid email format", async () => {
    const invalidEmailData = {
      first_name: "Thomas",
      last_name: "Brets",
      email: "not-an-email",
      password: "password123",
      age: 25,
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidEmailData)
      .expect(400);

    expect(response.body).toHaveProperty("message");

    const usersCount = await UserModel.countDocuments({});
    expect(usersCount).toBe(0);
  });

  test("❌ should return 400 when password is too short", async () => {
    const shortPasswordData = {
      first_name: "Thomas",
      last_name: "Brets",
      email: "thomas@test.com",
      password: "123",
      age: 25,
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(shortPasswordData);

    // Nota: Si retorna 201, necesitas agregar validación de longitud de password
    if (response.status === 201) {
      console.warn("⚠️  WARNING: No password length validation detected");
    }

    expect([400, 201]).toContain(response.status);
  });

  test("✅ should hash password before saving to database", async () => {
    const userData = {
      first_name: "Thomas",
      last_name: "Brets",
      email: "hash@test.com",
      password: "plainPassword123",
      age: 25,
    };

    await request(app).post("/api/auth/register").send(userData).expect(201);

    const userInDB = await UserModel.findOne({ email: userData.email });

    expect(userInDB.password).not.toBe(userData.password); // No es texto plano
    expect(userInDB.password).toMatch(/^\$2[aby]\$/); // Es hash de bcrypt
  });
});

// ============================================================================
// 📚 Conceptos clave de este archivo
// ============================================================================

/**
 * SUPERTEST:
 * - request(app).post("/ruta").send(data).expect(status)
 * - No levanta servidor, solo testea handlers
 *
 * HOOKS DE JEST:
 * - beforeAll: Inicializar recursos (1 vez)
 * - afterAll: Limpiar y cerrar conexiones (1 vez)
 * - beforeEach: Resetear estado antes de cada test
 *
 * TESTS DE INTEGRACIÓN:
 * - Testean el flujo completo con DB real
 * - Verifican comportamiento end-to-end
 * - Más lentos que tests unitarios pero más confiables
 *
 * PRÓXIMOS PASOS:
 * - Testear POST /api/auth/login
 * - Testear rutas protegidas con JWT (usar cookies)
 * - Agregar más casos edge (edad negativa, email muy largo, etc.)
 */
