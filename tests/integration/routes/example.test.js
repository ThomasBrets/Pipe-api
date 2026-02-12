/**
 * EJEMPLO: Test de integración de rutas
 *
 * Tests de integración testean el flujo completo: Request → Route → Controller → Service → DB
 * Usan supertest para hacer requests HTTP sin levantar el servidor.
 */

import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
// import app from "../../../src/app.js";
// import mongoose from "mongoose";

describe("Example Routes Integration Tests", () => {
  // Conexión a DB de test
  beforeAll(async () => {
    // Conectar a DB de test
    // await mongoose.connect(process.env.MONGODB_TEST_URL);
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    // await mongoose.connection.dropDatabase();
    // await mongoose.connection.close();
  });

  describe("GET /api/example", () => {
    test("should return 200 and list of items", async () => {
      // const response = await request(app)
      //   .get("/api/example")
      //   .expect(200)
      //   .expect("Content-Type", /json/);

      // expect(response.body).toBeInstanceOf(Array);
    });

    test("should return 404 for non-existent route", async () => {
      // const response = await request(app)
      //   .get("/api/non-existent")
      //   .expect(404);
    });
  });

  describe("POST /api/example", () => {
    test("should create new item with valid data", async () => {
      // const newItem = {
      //   name: "Test Item",
      //   description: "Test Description"
      // };

      // const response = await request(app)
      //   .post("/api/example")
      //   .send(newItem)
      //   .expect(201)
      //   .expect("Content-Type", /json/);

      // expect(response.body).toHaveProperty("_id");
      // expect(response.body.name).toBe(newItem.name);
    });

    test("should return 400 with invalid data", async () => {
      // const invalidItem = { name: "" }; // datos inválidos

      // const response = await request(app)
      //   .post("/api/example")
      //   .send(invalidItem)
      //   .expect(400);

      // expect(response.body).toHaveProperty("message");
    });
  });

  describe("Authentication tests", () => {
    test("should return 401 for protected route without token", async () => {
      // const response = await request(app)
      //   .get("/api/users/profile")
      //   .expect(401);
    });

    test("should access protected route with valid token", async () => {
      // // Primero hacer login para obtener token
      // const loginResponse = await request(app)
      //   .post("/api/auth/login")
      //   .send({ email: "test@test.com", password: "password123" });

      // const token = loginResponse.headers["set-cookie"];

      // // Usar token en request protegido
      // const response = await request(app)
      //   .get("/api/users/profile")
      //   .set("Cookie", token)
      //   .expect(200);
    });
  });
});
