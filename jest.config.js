export default {
  // Configuración para Node.js (no DOM)
  testEnvironment: "node",

  // Soporte para ES Modules (no se necesita extensionsToTreatAsEsm porque package.json tiene "type": "module")
  transform: {},

  // Patrón para encontrar archivos de test
  testMatch: [
    "**/tests/**/*.test.js",
    "**/tests/**/*.spec.js"
  ],

  // Archivos a ejecutar antes de los tests (setup global)
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Cobertura de código
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/app.js", // Excluir entry point
    "!src/config/**", // Excluir configuración de DB (ya que es side-effect)
    "!src/daos/models/**", // Excluir modelos de Mongoose
  ],

  // Umbral de cobertura (opcional, pero recomendado)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Directorio de reportes de cobertura
  coverageDirectory: "coverage",

  // Formato de reportes
  coverageReporters: ["text", "lcov", "html"],

  // Timeout por defecto para tests (en ms)
  testTimeout: 10000,

  // Verbose muestra cada test individual
  verbose: true,

  // Ejecutar suites secuencialmente para evitar conflictos en la DB de test
  // Sin esto, los beforeEach de distintos suites se pisan al compartir la misma DB
  maxWorkers: 1,

  // Ignorar node_modules y otros directorios
  testPathIgnorePatterns: [
    "/node_modules/",
    "/coverage/"
  ],

  // Variables de entorno para tests
  // Esto previene que Jest intente cargar .env real
  modulePathIgnorePatterns: [],
};
