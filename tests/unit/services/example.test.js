/**
 * EJEMPLO: Test unitario de servicio
 *
 * Tests unitarios NO tocan la base de datos ni hacen requests HTTP.
 * Mockean todas las dependencias externas.
 */

import { describe, test, expect, jest, beforeEach } from "@jest/globals";

describe("Example Service Unit Tests", () => {
  // Mock de dependencias
  let mockRepository;
  let serviceInstance;

  beforeEach(() => {
    // Resetear mocks antes de cada test
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
    };

    // Instanciar servicio con dependencias mockeadas
    // serviceInstance = new ExampleService(mockRepository);
  });

  test("should call repository method correctly", async () => {
    // Arrange: configurar el mock
    mockRepository.getAll.mockResolvedValue([{ id: 1, name: "test" }]);

    // Act: ejecutar el método
    // const result = await serviceInstance.getAllItems();

    // Assert: verificar comportamiento
    // expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    // expect(result).toHaveLength(1);
    // expect(result[0]).toHaveProperty("name", "test");
  });

  test("should handle errors correctly", async () => {
    // Arrange: mock que arroja error
    mockRepository.getById.mockRejectedValue(new Error("Not found"));

    // Act & Assert: verificar que el error se propaga correctamente
    // await expect(serviceInstance.getItemById("123")).rejects.toThrow("Not found");
  });
});
