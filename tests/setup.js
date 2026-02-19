/**
 * 🔧 Setup Global para Tests
 *
 * Este archivo se ejecuta automáticamente antes de todos los tests.
 * Configurado en jest.config.js con la opción "setupFilesAfterEnv".
 */

import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import { jest, afterEach, afterAll } from "@jest/globals";
import mongoose from "mongoose";

// ============================================================================
// CONFIGURACIÓN DE ENTORNO
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Loading test environment...');

// Cargar variables de entorno de .env.test (en lugar de .env)
dotenv.config({
  path: path.resolve(__dirname, '../.env.test')
});

console.log('✅ Test environment loaded');
console.log(`📊 Database: ${process.env.MONGODB_URL?.split('/').pop()?.split('?')[0]}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

// ============================================================================
// CONFIGURACIÓN DE JEST
// ============================================================================

// Timeout global: 10 segundos (suficiente para operaciones de DB)
jest.setTimeout(10000);

// ============================================================================
// HOOKS GLOBALES
// ============================================================================

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Cerrar conexión a MongoDB al finalizar TODOS los suites
// Con runInBand los suites corren en el mismo proceso, por eso el cierre
// debe hacerse una sola vez al final y no en cada suite individualmente
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});