/**
 * 🧪 Tests de Integración: /api/products
 *
 * Testea el flujo completo: Request → Routes → Controller → Service → Repository → DB
 * Usa base de datos de test real (no mocks) y supertest para requests HTTP
 *
 * Rutas públicas:  GET /api/products, GET /api/products/:pid
 * Rutas protegidas (ADMIN): POST, PUT, DELETE /api/products
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
import { ProductModel } from "../../../src/daos/models/product.js";
import { UserModel } from "../../../src/daos/models/user.js";
import CartModel from "../../../src/daos/models/cart.js";

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================

describe("Products Endpoints - Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }
  });

  afterAll(async () => {
    try {
      await ProductModel.deleteMany({});
      await UserModel.deleteMany({});
      await CartModel.deleteMany({});
    } catch (error) {
      // Ignorar errores al limpiar
    }
  });

  beforeEach(async () => {
    await ProductModel.deleteMany({});
    await UserModel.deleteMany({});
    await CartModel.deleteMany({});
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Crea un producto directamente en la DB (para usar como Arrange en tests)
   */
  const createProductInDB = async (overrides = {}) => {
    return await ProductModel.create({
      title: "Teclado mecánico",
      description: "Teclado mecánico RGB con switches Cherry MX",
      price: 89.99,
      img: "https://ejemplo.com/teclado.jpg",
      code: "TEC-001",
      stock: 50,
      category: "periféricos",
      status: true,
      ...overrides,
    });
  };

  /**
   * Registra un usuario, lo promueve a ADMIN en la DB y hace login.
   * Retorna la cookie accessToken lista para usar en requests protegidos.
   */
  const loginAsAdmin = async () => {
    // 1. Registrar usuario
    await request(app)
      .post("/api/auth/register")
      .send({
        first_name: "Admin",
        last_name: "Test",
        email: "admin@test.com",
        password: "admin123",
        age: 30,
      })
      .expect(201);

    // 2. Promover a ADMIN directamente en la DB (no hay endpoint público para esto)
    await UserModel.updateOne(
      { email: "admin@test.com" },
      { role: "admin" }
    );

    // 3. Login para obtener la cookie
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "admin123" })
      .expect(200);

    return loginResponse.headers["set-cookie"];
  };

  /**
   * Registra un usuario normal (rol "user") y hace login.
   * Retorna la cookie para verificar que las rutas admin lo rechacen con 403.
   */
  const loginAsUser = async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        first_name: "User",
        last_name: "Test",
        email: "user@test.com",
        password: "user123",
        age: 25,
      })
      .expect(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@test.com", password: "user123" })
      .expect(200);

    return loginResponse.headers["set-cookie"];
  };

  // ============================================================================
  // TESTS: GET /api/products
  // ============================================================================

  describe("GET /api/products", () => {
    test("✅ should return empty array when no products exist", async () => {
      const response = await request(app)
        .get("/api/products")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    test("✅ should return all products", async () => {
      // Arrange: Crear 2 productos en DB
      await createProductInDB({ code: "TEC-001" });
      await createProductInDB({ title: "Mouse inalámbrico", code: "MOU-002" });

      const response = await request(app)
        .get("/api/products")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      // Verificar estructura de un producto
      const product = response.body[0];
      expect(product).toHaveProperty("_id");
      expect(product).toHaveProperty("title");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("code");
      expect(product).toHaveProperty("stock");
      expect(product).toHaveProperty("status");
    });

    test("✅ should respect ?limit query param", async () => {
      // Arrange: Crear 3 productos
      await createProductInDB({ code: "COD-001" });
      await createProductInDB({ code: "COD-002" });
      await createProductInDB({ code: "COD-003" });

      // Act: Pedir solo 2
      const response = await request(app)
        .get("/api/products?limit=2")
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  // ============================================================================
  // TESTS: GET /api/products/:pid
  // ============================================================================

  describe("GET /api/products/:pid", () => {
    test("✅ should return product when it exists", async () => {
      // Arrange
      const product = await createProductInDB();

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      // Assert: Verificar que retorna el producto correcto
      expect(response.body).toHaveProperty("_id", product._id.toString());
      expect(response.body).toHaveProperty("title", product.title);
      expect(response.body).toHaveProperty("code", product.code);
      expect(response.body).toHaveProperty("price", product.price);
    });

    test("❌ should return 404 when product does not exist", async () => {
      // Arrange: ID válido pero que no existe en DB
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/products/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Producto no encontrado");
    });

    test("❌ should return error when ID format is invalid", async () => {
      const response = await request(app)
        .get("/api/products/id-invalido");

      // Mongoose lanza CastError con IDs inválidos, puede ser 400 o 500
      // Verifica que el status code sea 400 o mayor.
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ============================================================================
  // TESTS: POST /api/products (ADMIN)
  // ============================================================================

  describe("POST /api/products", () => {
    test("✅ admin should create product successfully", async () => {
      // Arrange
      const adminCookie = await loginAsAdmin();
      const productData = {
        title: "Monitor 4K",
        description: "Monitor 4K UHD 27 pulgadas",
        price: 349.99,
        code: "MON-001",
        stock: 20,
        category: "monitores",
        status: true,
      };

      // Act
      const response = await request(app)
        .post("/api/products")
        .set("Cookie", adminCookie)
        .send(productData)
        .expect(201);

      // Assert: Verificar respuesta
      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("title", productData.title);
      expect(response.body).toHaveProperty("code", productData.code);
      expect(response.body).toHaveProperty("price", productData.price);

      // Assert: Verificar que se guardó en DB
      const productInDB = await ProductModel.findById(response.body._id);
      expect(productInDB).toBeTruthy();
      expect(productInDB.title).toBe(productData.title);
    });

    test("❌ should return 401 without authentication cookie", async () => {
      const productData = {
        title: "Producto sin auth",
        description: "test",
        price: 10,
        code: "TEST-001",
        stock: 5,
        category: "test",
        status: true,
      };

      const response = await request(app)
        .post("/api/products")
        .send(productData)
        .expect(401);

      expect(response.body).toHaveProperty("error");

      // Verificar que no se creó en DB
      const count = await ProductModel.countDocuments({});
      expect(count).toBe(0);
    });

    test("❌ should return 403 when user is not ADMIN", async () => {
      // Arrange: Loguear como usuario normal
      const userCookie = await loginAsUser();
      const productData = {
        title: "Producto de user",
        description: "test",
        price: 10,
        code: "TEST-002",
        stock: 5,
        category: "test",
        status: true,
      };

      const response = await request(app)
        .post("/api/products")
        .set("Cookie", userCookie)
        .send(productData)
        .expect(403);

      expect(response.body).toHaveProperty("message");

      const count = await ProductModel.countDocuments({});
      expect(count).toBe(0);
    });
  });

  // ============================================================================
  // TESTS: PUT /api/products/:pid (ADMIN)
  // ============================================================================

  describe("PUT /api/products/:pid", () => {
    test("✅ admin should update product successfully", async () => {
      // Arrange
      const adminCookie = await loginAsAdmin();
      const product = await createProductInDB();

      const updateData = { price: 79.99, stock: 30 };

      // Act
      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set("Cookie", adminCookie)
        .send(updateData)
        .expect(200);

      // Assert: Verificar respuesta
      expect(response.body).toHaveProperty("price", updateData.price);
      expect(response.body).toHaveProperty("stock", updateData.stock);

      // Assert: Verificar que se actualizó en DB
      const updatedProduct = await ProductModel.findById(product._id);
      expect(updatedProduct.price).toBe(updateData.price);
      expect(updatedProduct.stock).toBe(updateData.stock);
    });

    test("❌ should return 401 without authentication cookie", async () => {
      const product = await createProductInDB();

      await request(app)
        .put(`/api/products/${product._id}`)
        .send({ price: 1 })
        .expect(401);
    });

    test("❌ should return 404 when product does not exist", async () => {
      const adminCookie = await loginAsAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .set("Cookie", adminCookie)
        .send({ price: 50 })
        .expect(404);

      expect(response.body).toHaveProperty("message", "Producto no encontrado");
    });
  });

  // ============================================================================
  // TESTS: DELETE /api/products/:pid (ADMIN)
  // ============================================================================

  describe("DELETE /api/products/:pid", () => {
    test("✅ admin should delete product successfully", async () => {
      // Arrange
      const adminCookie = await loginAsAdmin();
      const product = await createProductInDB();

      // Act
      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set("Cookie", adminCookie)
        .expect(200);

      // Assert: Verificar mensaje
      expect(response.body).toHaveProperty("message", "Producto eliminado con éxito");

      // Assert: Verificar que se eliminó de DB
      const productInDB = await ProductModel.findById(product._id);
      expect(productInDB).toBeNull();
    });

    test("❌ should return 401 without authentication cookie", async () => {
      const product = await createProductInDB();

      await request(app)
        .delete(`/api/products/${product._id}`)
        .expect(401);

      // Verificar que el producto sigue en DB
      const productInDB = await ProductModel.findById(product._id);
      expect(productInDB).toBeTruthy();
    });

    test("❌ should return 404 when product does not exist", async () => {
      const adminCookie = await loginAsAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`)
        .set("Cookie", adminCookie)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Producto no encontrado");
    });
  });

}); // Fin describe Products Endpoints

// ============================================================================
// 📚 Conceptos clave de este archivo
// ============================================================================

/**
 * HELPERS EN TESTS DE INTEGRACIÓN:
 * - createProductInDB(): crea directamente en DB (evita pasar por HTTP)
 * - loginAsAdmin(): registra user → promueve a admin en DB → login → retorna cookie
 * - loginAsUser(): registra user normal → login → retorna cookie
 *
 * ¿POR QUÉ PROMOVER EN DB Y NO POR ENDPOINT?
 * - No hay endpoint público para crear admins (sería un problema de seguridad)
 * - En tests es válido manipular la DB directamente para configurar estado inicial
 * - Es el patrón estándar: "arrange" puede usar la DB directamente
 *
 * RUTAS PÚBLICAS vs PROTEGIDAS:
 * - Públicas (GET):  no necesitan cookie, cualquiera puede acceder
 * - Protegidas (POST, PUT, DELETE): necesitan cookie + rol ADMIN
 * - Sin cookie → 401 Unauthorized
 * - Con cookie de user normal → 403 Forbidden
 * - Con cookie de admin → 200/201 ✅
 */
