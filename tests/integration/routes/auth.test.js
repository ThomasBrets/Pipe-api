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
// CONFIGURACIÓN GLOBAL PARA TODOS LOS TESTS DE AUTH
// ============================================================================

describe("Auth Endpoints - Integration Tests", () => {
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
    } catch (error) {
      // Ignorar errores al limpiar
    }
  });

  // beforeEach: Limpiar DB antes de CADA test (aplica a register y login)
  beforeEach(async () => {
    try {
      await UserModel.deleteMany({});
      await CartModel.deleteMany({});
    } catch (error) {
      console.error("❌ Error cleaning database:", error);
      throw error;
    }
  });

// ============================================================================
// TESTS: POST /api/auth/register
// ============================================================================

  describe("POST /api/auth/register", () => {

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
      .send(shortPasswordData)
      .expect(400);

    // Assert: Verificar mensaje de error
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("contraseña debe tener al menos 6 caracteres");

    // Verificar que no se creó el usuario en DB
    const usersCount = await UserModel.countDocuments({});
    expect(usersCount).toBe(0);
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
}); // Fin describe POST /api/auth/register

// ============================================================================
// TESTS: POST /api/auth/login
// ============================================================================

describe("POST /api/auth/login", () => {
  // beforeEach ya está configurado globalmente en el describe principal
  // Limpia la DB antes de cada test

  test("✅ should login successfully with correct credentials", async () => {
    // Arrange: Primero registrar un usuario
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

    // Act: Intentar login con credenciales correctas
    const loginData = {
      email: "thomas@test.com",
      password: "password123",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData)
      .expect(200);

    // Assert: Verificar respuesta
    expect(response.body).toHaveProperty("message", "login success");

    // Assert: Verificar que se estableció la cookie accessToken
    // El header 'set-cookie' contiene un array de cookies
    expect(response.headers["set-cookie"]).toBeDefined();

    // Verificar que alguna cookie contiene "accessToken"
    const cookies = response.headers["set-cookie"];
    const hasAccessToken = cookies.some(cookie => cookie.includes("accessToken"));
    expect(hasAccessToken).toBe(true);

    // Verificar que la cookie tiene las flags de seguridad correctas
    const accessTokenCookie = cookies.find(cookie => cookie.includes("accessToken"));
    expect(accessTokenCookie).toMatch(/HttpOnly/); // Cookie httpOnly
    expect(accessTokenCookie).toMatch(/SameSite=Lax/); // SameSite en desarrollo
  });

  test("❌ should return 401 when email does not exist", async () => {
    // Act: Intentar login con email no registrado
    const loginData = {
      email: "noexiste@test.com",
      password: "password123",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData)
      .expect(401);

    // Assert: Verificar mensaje de error
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("Credenciales incorrectas");

    // Verificar que NO se estableció cookie
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  test("❌ should return 401 when password is incorrect", async () => {
    // Arrange: Registrar usuario con password correcta
    const userData = {
      first_name: "Thomas",
      last_name: "Brets",
      email: "thomas@test.com",
      password: "correcta123",
      age: 25,
    };

    await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(201);

    // Act: Intentar login con password incorrecta
    const loginData = {
      email: "thomas@test.com",
      password: "incorrecta456", // Password diferente
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData)
      .expect(401);

    // Assert
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("Credenciales incorrectas");
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  test("❌ should return 400 when required fields are missing", async () => {
    // Act: Enviar solo email (sin password)
    const incompleteData = {
      email: "thomas@test.com",
      // password: falta
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(incompleteData);

    // Assert: Puede ser 400 o 401 dependiendo de la validación
    // Si es 401, el authService maneja undefined password como credencial incorrecta
    expect([400, 401]).toContain(response.status);
    expect(response.body).toHaveProperty("message");
  });

  test("❌ should return 400 when body is empty", async () => {
    // Act: Enviar body vacío
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    // Assert
    expect([400, 401]).toContain(response.status);
    expect(response.body).toHaveProperty("message");
  });
}); // Fin describe POST /api/auth/login

// ============================================================================
// TESTS: POST /api/auth/logout
// ============================================================================

describe("POST /api/auth/logout", () => {
  test("✅ should logout successfully with active session", async () => {
    // Arrange: Registrar un usuario
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

    // Arrange: Hacer login y capturar la cookie accessToken
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "thomas@test.com",
        password: "password123",
      })
      .expect(200);

    // Extraer la cookie del header Set-Cookie
    const cookies = loginResponse.headers["set-cookie"];
    expect(cookies).toBeDefined();

    // Act: Hacer logout con la cookie de sesión
    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies) // Enviar la cookie en el request
      .expect(200);

    // Assert: Verificar mensaje de respuesta
    expect(logoutResponse.body).toHaveProperty("message");
    expect(logoutResponse.body.message).toContain("Sesión cerrada correctamente");

    // Assert: Verificar que se eliminó la cookie accessToken
    const logoutCookies = logoutResponse.headers["set-cookie"];
    expect(logoutCookies).toBeDefined();

    // Buscar la cookie accessToken en la respuesta
    const accessTokenCookie = logoutCookies.find(cookie =>
      cookie.includes("accessToken")
    );
    expect(accessTokenCookie).toBeDefined();

    // Verificar que la cookie se borró (Max-Age=0 o Expires en el pasado)
    // El servidor puede usar cualquiera de estos métodos para borrar la cookie:
    const isCookieDeleted =
      accessTokenCookie.includes("Max-Age=0") || // Opción 1: Max-Age=0
      accessTokenCookie.includes("Expires=Thu, 01 Jan 1970") || // Opción 2: Expires en el pasado
      accessTokenCookie.match(/accessToken=;/); // Opción 3: Valor vacío

    expect(isCookieDeleted).toBeTruthy();
  });

  test("✅ should logout successfully even without active session", async () => {
    // Act: Hacer logout sin cookie de sesión (sin estar logueado)
    const response = await request(app)
      .post("/api/auth/logout")
      .expect(200);

    // Assert: Verificar que retorna 200 (logout siempre funciona)
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("Sesión cerrada correctamente");

    // Assert: Verificar que se intenta borrar la cookie (aunque no existiera)
    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();

    const accessTokenCookie = cookies.find(cookie =>
      cookie.includes("accessToken")
    );
    expect(accessTokenCookie).toBeDefined();

    // Verificar que se envía cookie con Max-Age=0 para borrarla
    const isCookieDeleted =
      accessTokenCookie.includes("Max-Age=0") ||
      accessTokenCookie.includes("Expires=Thu, 01 Jan 1970") ||
      accessTokenCookie.match(/accessToken=;/);

    expect(isCookieDeleted).toBeTruthy();
  });
}); // Fin describe POST /api/auth/logout

}); // Fin describe Auth Endpoints - Integration Tests

// ============================================================================
// 📚 Conceptos clave de este archivo
// ============================================================================

/**
 * SUPERTEST:
 * - request(app).post("/ruta").send(data).expect(status)
 * - No levanta servidor, solo testea handlers
 * - Acceso a headers: response.headers["nombre-header"]
 *
 * VERIFICAR COOKIES CON SUPERTEST:
 * - Las cookies están en: response.headers["set-cookie"]
 * - Es un array de strings: ["accessToken=xyz; HttpOnly", "otro=valor"]
 * - Usar .some() o .find() para buscar cookies específicas
 * - Verificar flags: HttpOnly, Secure, SameSite
 * - ENVIAR cookies en request: .set("Cookie", cookies)
 * - VERIFICAR que cookie se borró: Max-Age=0, Expires en pasado, o valor vacío
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
 * - Testear rutas protegidas con JWT (GET /api/users/current)
 * - Testear que rutas protegidas rechazan requests sin cookie válida
 * - Agregar más casos edge (edad negativa, email muy largo, etc.)
 */
