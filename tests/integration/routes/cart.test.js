/**
 * 🧪 Tests de Integración: /api/users/carts
 *
 * Testea el flujo completo: Request → Routes → Controller → Service → Repository → DB
 *
 * RUTAS (montadas bajo /api/users por index.js con passportCall):
 * POST   /api/users/carts
 * GET    /api/users/carts/:cid
 * POST   /api/users/carts/:cid/products/:pid
 * DELETE /api/users/carts/:cid/products/:pid
 * POST   /api/users/carts/:cid/purchase
 * DELETE /api/users/carts/:cid
 *
 * NOTA SOBRE EL MOCK DE EMAIL:
 * purchaseCart llama a sendPurchaseEmailService (Nodemailer/Gmail).
 * Usamos jest.unstable_mockModule() para interceptarlo y evitar emails reales.
 * Esto requiere que app se importe dinámicamente DESPUÉS del mock.
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { UserModel } from "../../../src/daos/models/user.js";
import CartModel from "../../../src/daos/models/cart.js";
import { ProductModel } from "../../../src/daos/models/product.js";

// ============================================================================
// MOCK DEL SERVICIO DE EMAIL
// Debe declararse ANTES del import dinámico de app para interceptar el módulo
// ============================================================================
jest.unstable_mockModule("../../../src/services/email-services.js", () => ({
  sendPurchaseEmailService: jest.fn().mockResolvedValue({ messageId: "mock-test-id" }),
}));

// app se importa dinámicamente para que el mock ya esté registrado cuando
// cartService.js importa sendPurchaseEmailService
let app;

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================

describe("Cart Endpoints - Integration Tests", () => {
  beforeAll(async () => {
    // Importar app dinámicamente DESPUÉS del mock
    const module = await import("../../../src/app.js");
    app = module.default;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }
  });

  afterAll(async () => {
    try {
      await UserModel.deleteMany({});
      await CartModel.deleteMany({});
      await ProductModel.deleteMany({});
    } catch (error) {
      // Ignorar errores al limpiar
    }
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await CartModel.deleteMany({});
    await ProductModel.deleteMany({});
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Registra un usuario y hace login.
   * Retorna: { cookie, userData }
   */
  const loginAsUser = async () => {
    const userData = {
      first_name: "Thomas",
      last_name: "Brets",
      email: "thomas@test.com",
      password: "password123",
      age: 25,
    };

    await request(app).post("/api/auth/register").send(userData).expect(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    return { cookie: loginResponse.headers["set-cookie"], userData };
  };

  /**
   * Crea un producto directamente en la DB
   */
  const createProductInDB = async (overrides = {}) => {
    return await ProductModel.create({
      title: "Teclado mecánico",
      description: "Teclado mecánico RGB",
      price: 89.99,
      code: "TEC-001",
      stock: 50,
      category: "periféricos",
      status: true,
      ...overrides,
    });
  };

  /**
   * Crea un carrito vacío directamente en la DB
   * Retorna el carrito creado
   */
  const createCartInDB = async () => {
    return await CartModel.create({ products: [] });
  };

  // ============================================================================
  // TESTS: POST /api/users/carts
  // ============================================================================

  describe("POST /api/users/carts", () => {
    test("✅ should create cart for authenticated user", async () => {
      const { cookie } = await loginAsUser();

      const response = await request(app)
        .post("/api/users/carts")
        .set("Cookie", cookie)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Carrito creado");
      expect(response.body).toHaveProperty("cart");
      expect(response.body.cart).toHaveProperty("_id");
      expect(response.body.cart).toHaveProperty("products");
      expect(Array.isArray(response.body.cart.products)).toBe(true);
    });

    test("❌ should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/users/carts")
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  // ============================================================================
  // TESTS: GET /api/users/carts/:cid
  // ============================================================================

  describe("GET /api/users/carts/:cid", () => {
    test("✅ should return cart with its products", async () => {
      // Arrange: crear carrito y producto
      const { cookie } = await loginAsUser();
      const cart = await createCartInDB();
      const product = await createProductInDB();

      // Agregar producto al carrito directo en DB
      cart.products.push({ product: product._id, quantity: 2 });
      await cart.save();

      // Act
      const response = await request(app)
        .get(`/api/users/carts/${cart._id}`)
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toHaveProperty("_id", cart._id.toString());
      expect(response.body).toHaveProperty("products");
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0]).toHaveProperty("quantity", 2);
    });

    test("❌ should return 404 when cart does not exist", async () => {
      const { cookie } = await loginAsUser();
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/users/carts/${nonExistentId}`)
        .set("Cookie", cookie)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Carrito no encontrado");
    });
  });

  // ============================================================================
  // TESTS: POST /api/users/carts/:cid/products/:pid
  // ============================================================================

  describe("POST /api/users/carts/:cid/products/:pid", () => {
    test("✅ should add product to cart", async () => {
      // Arrange
      const { cookie } = await loginAsUser();
      const cart = await createCartInDB();
      const product = await createProductInDB();

      // Act
      const response = await request(app)
        .post(`/api/users/carts/${cart._id}/products/${product._id}`)
        .set("Cookie", cookie)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body).toHaveProperty("message", "Producto agregado al carrito");
      expect(response.body).toHaveProperty("cart");

      // Verificar que el producto está en el carrito en DB
      const updatedCart = await CartModel.findById(cart._id).populate("products.product");
      expect(updatedCart.products).toHaveLength(1);
      expect(updatedCart.products[0].quantity).toBe(3);
    });

    test("✅ should increment quantity if product already in cart", async () => {
      // Arrange: carrito con el producto ya agregado (quantity: 2)
      const { cookie } = await loginAsUser();
      const cart = await createCartInDB();
      const product = await createProductInDB();
      cart.products.push({ product: product._id, quantity: 2 });
      await cart.save();

      // Act: agregar el mismo producto (quantity: 3)
      await request(app)
        .post(`/api/users/carts/${cart._id}/products/${product._id}`)
        .set("Cookie", cookie)
        .send({ quantity: 3 })
        .expect(200);

      // Assert: quantity debe ser 2 + 3 = 5
      const updatedCart = await CartModel.findById(cart._id).populate("products.product");
      expect(updatedCart.products[0].quantity).toBe(5);
    });

    test("❌ should return 401 without authentication", async () => {
      const cart = await createCartInDB();
      const product = await createProductInDB();

      await request(app)
        .post(`/api/users/carts/${cart._id}/products/${product._id}`)
        .send({ quantity: 1 })
        .expect(401);
    });
  });

  // ============================================================================
  // TESTS: DELETE /api/users/carts/:cid/products/:pid
  // ============================================================================

  describe("DELETE /api/users/carts/:cid/products/:pid", () => {
    test("✅ should remove product from cart", async () => {
      // Arrange: carrito con producto
      const { cookie } = await loginAsUser();
      const cart = await createCartInDB();
      const product = await createProductInDB();
      cart.products.push({ product: product._id, quantity: 1 });
      await cart.save();

      // Act
      const response = await request(app)
        .delete(`/api/users/carts/${cart._id}/products/${product._id}`)
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Producto eliminado");

      // Verificar que se eliminó de DB
      const updatedCart = await CartModel.findById(cart._id);
      expect(updatedCart.products).toHaveLength(0);
    });
  });

  // ============================================================================
  // TESTS: POST /api/users/carts/:cid/purchase
  // ============================================================================

  describe("POST /api/users/carts/:cid/purchase", () => {
    test("✅ should process purchase and clear cart", async () => {
      // Arrange: carrito con producto
      const { cookie } = await loginAsUser();
      const cart = await createCartInDB();
      const product = await createProductInDB({ price: 89.99 });
      cart.products.push({ product: product._id, quantity: 2 });
      await cart.save();

      // Act
      const response = await request(app)
        .post(`/api/users/carts/${cart._id}/purchase`)
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Compra exitosa");
      expect(response.body).toHaveProperty("purchase");
      expect(response.body.purchase).toHaveProperty("total");

      // Verificar que el carrito quedó vacío después de la compra
      const updatedCart = await CartModel.findById(cart._id);
      expect(updatedCart.products).toHaveLength(0);
    });

    test("❌ should return 400 when cart is empty", async () => {
      // Arrange: carrito vacío
      const { cookie } = await loginAsUser();
      const cart = await createCartInDB();

      const response = await request(app)
        .post(`/api/users/carts/${cart._id}/purchase`)
        .set("Cookie", cookie)
        .expect(400);

      expect(response.body).toHaveProperty("message", "El carrito esta vacío");
    });
  });

  // ============================================================================
  // TESTS: DELETE /api/users/carts/:cid
  // ============================================================================

  describe("DELETE /api/users/carts/:cid", () => {
    test("✅ should clear all products from cart", async () => {
      // Arrange: carrito con 2 productos
      const { cookie } = await loginAsUser();
      const cart = await createCartInDB();
      const product1 = await createProductInDB({ code: "COD-001" });
      const product2 = await createProductInDB({ code: "COD-002" });
      cart.products.push(
        { product: product1._id, quantity: 1 },
        { product: product2._id, quantity: 3 }
      );
      await cart.save();

      // Act
      const response = await request(app)
        .delete(`/api/users/carts/${cart._id}`)
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Carrito vaciado");

      // Verificar en DB que quedó vacío
      const updatedCart = await CartModel.findById(cart._id);
      expect(updatedCart.products).toHaveLength(0);
    });
  });

}); // Fin describe Cart Endpoints

// ============================================================================
// 📚 Conceptos clave de este archivo
// ============================================================================

/**
 * MOCK DE EMAIL EN ESM (ES Modules):
 * - jest.mock() no funciona correctamente con ESM
 * - La solución es jest.unstable_mockModule() + import dinámico de app
 * - El mock DEBE declararse antes de importar app para interceptar el módulo
 * - app se importa con await import() dentro del beforeAll
 *
 * RUTAS DE CART:
 * - Todas requieren JWT porque passportCall se aplica en index.js a nivel de /users
 * - El cid puede ser cualquier carrito (no solo el del usuario logueado)
 *
 * POPULATE EN CARRITO:
 * - CartDao.getById() hace findById().populate("products.product")
 * - Al leer el carrito, product tiene todos sus campos (_id, title, price, etc.)
 * - purchaseCart() usa item.product.price para calcular el total
 *
 * HELPERS:
 * - createCartInDB() crea directamente en DB sin pasar por HTTP
 * - Agregar productos al carrito en DB: cart.products.push() + cart.save()
 * - Esto es más rápido y directo que hacer HTTP requests en el arrange
 */
