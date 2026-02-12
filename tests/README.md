# Testing Guide

Este proyecto usa **Jest** + **Supertest** para testing.

## Estructura de Tests

```
tests/
├── setup.js                      # Configuración global (se ejecuta antes de todos los tests)
├── unit/                         # Tests unitarios (con mocks)
│   └── services/                 # Tests de lógica de negocio
│       └── example.test.js
└── integration/                  # Tests de integración (con DB real/de test)
    └── routes/                   # Tests de endpoints HTTP
        └── example.test.js
```

## Comandos

```bash
# Ejecutar todos los tests
npm test

# Modo watch (re-ejecuta al guardar archivos)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## Diferencia: Unit vs Integration Tests

### Tests Unitarios (`/tests/unit/`)
- **Objetivo**: Testear lógica de negocio aislada
- **NO tocan**: Base de datos, HTTP, filesystem
- **Mockean**: Todas las dependencias (DAOs, repositories, servicios externos)
- **Rápidos**: Ejecutan en milisegundos
- **Ejemplo**: Testear que un servicio valide correctamente los datos antes de guardar

### Tests de Integración (`/tests/integration/`)
- **Objetivo**: Testear flujo completo Request → Response
- **SÍ tocan**: Base de datos de test, hacen HTTP requests
- **Usan**: Supertest para simular requests sin levantar servidor
- **Más lentos**: Ejecutan en segundos
- **Ejemplo**: Testear que POST /api/auth/register crea un usuario en DB

## Buenas Prácticas

### 1. Estructura AAA (Arrange-Act-Assert)
```javascript
test("should create user", async () => {
  // Arrange: preparar datos y mocks
  const userData = { email: "test@test.com", password: "123" };

  // Act: ejecutar la acción
  const result = await userService.register(userData);

  // Assert: verificar resultado
  expect(result).toHaveProperty("_id");
});
```

### 2. Nombres descriptivos
```javascript
// ❌ Mal
test("test 1", () => {});

// ✅ Bien
test("should return 400 when email is invalid", () => {});
```

### 3. Limpiar después de cada test
```javascript
afterEach(async () => {
  await User.deleteMany({}); // Limpiar DB
  jest.clearAllMocks();      // Limpiar mocks
});
```

### 4. Tests de integración con DB de test
Usá una base de datos separada para tests:

```javascript
// En tests/setup.js o beforeAll
process.env.MONGODB_URL = "mongodb://localhost:27017/pipe-api-test";
```

### 5. Testing de autenticación
Para rutas protegidas, primero hacer login:

```javascript
test("should access protected route", async () => {
  // Login para obtener cookie
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@test.com", password: "123" });

  const cookies = loginRes.headers["set-cookie"];

  // Usar cookie en request protegido
  const response = await request(app)
    .get("/api/users/profile")
    .set("Cookie", cookies);

  expect(response.status).toBe(200);
});
```

## Cobertura de Código

El reporte de cobertura se genera en `/coverage/`:
- `coverage/lcov-report/index.html` - Reporte HTML interactivo
- `coverage/lcov.info` - Para integración con CI/CD

**Umbrales configurados** (en `jest.config.js`):
- 50% de líneas, funciones, branches y statements

## Tips

1. **Mockear dependencias externas**: No hagas requests a APIs reales en tests
2. **Usar `describe` para agrupar**: Organiza tests relacionados
3. **Un assert por test**: Cada test debe verificar UNA cosa específica
4. **Tests independientes**: Un test NO debe depender del resultado de otro
5. **Datos de test realistas**: Usá datos similares a producción

## Próximos Pasos

1. Crear tests para `authService` (unit)
2. Crear tests para rutas `/api/auth/*` (integration)
3. Agregar tests para casos de error (validaciones, 404, 401, etc.)
4. Configurar CI/CD para ejecutar tests automáticamente
