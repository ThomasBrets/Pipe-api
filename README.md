# Pipe API — E-commerce Backend

![Tests](https://img.shields.io/badge/tests-50%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-78%25-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue)
![Express](https://img.shields.io/badge/express-5.x-lightgrey)
![License](https://img.shields.io/badge/license-ISC-blue)

REST API para una aplicación de e-commerce, construida con Node.js y Express. Implementa autenticación JWT mediante cookies HTTP-only, arquitectura en capas estricta y documentación interactiva con Swagger.

**Frontend en producción:** [pipe-front.vercel.app](https://pipe-front.vercel.app)
**Documentación API:** `[http://localhost:3000/api-docs](https://pipe-api.onrender.com/api-docs)`

---

## Features

- **Autenticación JWT** con cookies HTTP-only (seguro contra XSS)
- **Arquitectura en 6 capas** estricta y desacoplada
- **CRUD completo** de productos, carritos y usuarios
- **Roles de acceso** — endpoints protegidos para `ADMIN`
- **Carrito de compras** con flujo completo hasta la compra
- **Email de confirmación** al finalizar una compra (Nodemailer/Gmail)
- **Documentación interactiva** con Swagger UI / OpenAPI 3.0
- **Testing exhaustivo** — 50 tests de integración, **coverage 78%+**
- **ES Modules** — codebase 100% con sintaxis `import/export`

---

## Tech Stack

| Categoría | Tecnología |
|-----------|-----------|
| Runtime | Node.js ≥ 18 |
| Framework | Express 5.x |
| Base de datos | MongoDB + Mongoose 8.x |
| Autenticación | JWT (jsonwebtoken) + Passport.js |
| Hashing | Bcrypt 6.x |
| Email | Nodemailer 7.x (Gmail) |
| Documentación | Swagger JSDoc + Swagger UI Express |
| Testing | Jest 30 + Supertest |
| Variables de entorno | dotenv |

---

## Arquitectura

El proyecto sigue una **arquitectura en 6 capas** donde cada capa tiene una responsabilidad única. Los datos fluyen en un solo sentido:

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Routes    │  Define endpoints y aplica middlewares (auth, roles)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controllers │  Extrae datos del request, llama al servicio, envía response
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Services   │  Contiene la lógica de negocio
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Repositories │  Abstrae el acceso a datos, add validaciones de dominio
└──────┬───────┘
       │
       ▼
┌─────────────┐
│    DAOs     │  Interactúa directamente con Mongoose
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Models    │  Schemas de Mongoose
└─────────────┘
```

**Capas adicionales:**
- **DTOs** (`src/dtos/`) — Filtran datos sensibles antes de enviar al cliente (ej: eliminan `password`)
- **Middlewares** (`src/middlewares/`) — Autenticación JWT, manejo de errores, verificación de roles

### Estructura del proyecto

```
src/
├── app.js                    # Entry point — Express config, middlewares, rutas
├── config/
│   ├── db.js                 # Conexión a MongoDB
│   ├── nodemailer.js         # Configuración de email
│   └── swagger.js            # Configuración OpenAPI 3.0
├── routes/                   # Definición de endpoints
├── controllers/              # Manejo de request/response HTTP
├── services/                 # Lógica de negocio
├── repositories/             # Abstracción de acceso a datos
├── daos/
│   ├── models/               # Schemas de Mongoose
│   ├── mongoDao.js           # DAO base con CRUD genérico
│   ├── cartDao.js
│   ├── productDao.js
│   └── userDao.js
├── dtos/
│   └── user.dto.js           # Filtra password y tokens sensibles
├── middlewares/
│   ├── errorHandler.js       # Manejo global de errores
│   ├── verifyRole.js         # Control de acceso por rol
│   └── passport/             # Estrategia JWT con cookies
└── utils/
    ├── custom-error.js       # Clase de errores personalizados con status code
    └── user-utils.js         # createHash() e isValid() para bcrypt
```

---

## Instalación

### Requisitos previos
- Node.js ≥ 18
- MongoDB Atlas o MongoDB local

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/ThomasBrets/Pipe-api.git
cd Pipe-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Levantar el servidor
npm start
```

El servidor queda disponible en `http://localhost:3000`.

---

## Variables de entorno

Crear un archivo `.env` en la raíz (ver `.env.example` como referencia):

```env
# MongoDB connection string
MONGODB_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/pipe-ecommerce

# Puerto del servidor
PORT=3000

# Clave secreta para firmar JWT (usar cadena larga y aleatoria)
JWT_SECRET=your_super_secret_key

# Entorno: development | production | test
NODE_ENV=development

# Cuenta Gmail para envío de emails
EMAIL_USER=your_email@gmail.com

# App Password de Gmail (no es la contraseña normal)
EMAIL_PASS=your_gmail_app_password
```

> **Gmail App Password:** generala en Google Account → Security → 2-Step Verification → App passwords

---

## API Reference

La documentación completa e interactiva está disponible en Swagger UI:

```
http://localhost:3000/api-docs
```

### Resumen de endpoints

#### Auth — Público
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión (establece cookie JWT) |
| POST | `/api/auth/logout` | Cerrar sesión (elimina cookie) |

#### Users — 🔒 Requiere JWT
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/current` | Obtener usuario autenticado |

#### Products — Mixto
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos (`?limit=N`) |
| GET | `/api/products/:pid` | Obtener producto por ID |
| POST | `/api/products` | 🔒 Admin — Crear producto |
| PUT | `/api/products/:pid` | 🔒 Admin — Actualizar producto |
| DELETE | `/api/products/:pid` | 🔒 Admin — Eliminar producto |

#### Cart — 🔒 Requiere JWT
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/users/carts` | Crear carrito |
| GET | `/api/users/carts/:cid` | Ver carrito con productos |
| POST | `/api/users/carts/:cid/products/:pid` | Agregar producto |
| PUT | `/api/users/carts/:cid/products/:pid` | Actualizar cantidad |
| DELETE | `/api/users/carts/:cid/products/:pid` | Quitar producto |
| POST | `/api/users/carts/:cid/purchase` | Finalizar compra |
| DELETE | `/api/users/carts/:cid` | Vaciar carrito |

---

## Testing

El proyecto cuenta con **50 tests de integración** que cubren el flujo completo HTTP → DB usando una base de datos de test dedicada.

```bash
# Correr todos los tests
npm test

# Modo watch (re-ejecuta al guardar)
npm run test:watch

# Generar reporte de coverage
npm run test:coverage
```

### Cobertura actual

```
All files  |  78.9% Stmts  |  65% Branch  |  85.5% Funcs  |  80.3% Lines
```

### Distribución de tests

| Suite | Tests | Descripción |
|-------|-------|-------------|
| `auth.test.js` | 13 | Register, login, logout |
| `products.test.js` | 15 | CRUD público y protegido (admin) |
| `users.test.js` | 3 | GET /current autenticado y 401 |
| `cart.test.js` | 11 | Flujo completo de carrito y compra |
| `examples` | 8 | Tests de ejemplo |

### Patrones de testing utilizados

- **Integración real con DB** — sin mocks de base de datos
- **DB de test aislada** — base de datos `pipe-test` separada de producción
- **`beforeEach` limpia la DB** — cada test parte de estado conocido
- **`maxWorkers: 1`** — suites secuenciales para evitar race conditions en DB compartida
- **`jest.unstable_mockModule()`** — mock de ESM para el servicio de email en tests de compra
- **Helpers reutilizables** — `loginAsAdmin()`, `createProductInDB()`, `createCartInDB()`

---

## Deploy

La API está configurada para correr en producción con las siguientes consideraciones:

- `NODE_ENV=production` activa cookies con `Secure: true` y `SameSite: none` (requerido para cross-origin con el frontend en Vercel)
- CORS configurado para el origen `https://pipe-front.vercel.app`
- La conexión a MongoDB usa Atlas para alta disponibilidad

---

## Autor

**Thomas Brets**
Backend Developer — CoderHouse Backend Avanzado

[![GitHub](https://img.shields.io/badge/GitHub-ThomasBrets-181717?logo=github)](https://github.com/ThomasBrets)
