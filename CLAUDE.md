# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pipe API is a Node.js/Express backend for an e-commerce application. It uses MongoDB with Mongoose, implements JWT authentication via HTTP-only cookies, and follows a strict layered architecture pattern.

**Tech Stack:**
- Node.js with ES modules (`"type": "module"`)
- Express 5.x
- MongoDB via Mongoose
- JWT authentication with Passport
- Bcrypt for password hashing
- Nodemailer for email services
- CORS configured for production frontend at `https://pipe-front.vercel.app`

## Running the Application

**Start the server:**
```bash
npm start
```
This runs `node src/app.js` and starts the server on port 3000 (or `PORT` from `.env`).

**Environment Variables:**
Create a `.env` file with:
- `MONGODB_URL` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT token signing
- `EMAIL_USER` - Gmail account for nodemailer
- `EMAIL_PASS` - Gmail app password
- `NODE_ENV` - Set to "production" for production environments

## Architecture

The codebase follows a **strict 6-layer architecture**. Data flows through these layers in order:

```
Routes → Controllers → Services → Repositories → DAOs → Models
```

**Layer Responsibilities:**

1. **Routes** (`src/routes/`): Define HTTP endpoints and attach middlewares. Route handlers delegate to controllers.

2. **Controllers** (`src/controllers/`): Handle HTTP request/response. Extract data from `req`, call service methods, send `res`, and pass errors to `next()`.

3. **Services** (`src/services/`): Contain business logic. Orchestrate operations across multiple repositories. Do NOT directly touch database models.

4. **Repositories** (`src/repositories/`): Abstract the data layer. Call DAO methods and can add additional data access logic. Currently some repositories are thin wrappers.

5. **DAOs** (`src/daos/`): Data Access Objects. Directly interact with Mongoose models. Most DAOs extend `MongoDao` base class which provides standard CRUD operations (`getAll`, `getById`, `create`, `update`, `delete`).

6. **Models** (`src/daos/models/`): Mongoose schema definitions.

**Additional Layers:**
- **DTOs** (`src/dtos/`): Data Transfer Objects that sanitize data by removing sensitive fields (e.g., `UserDto` removes password before sending user data to client).
- **Middlewares** (`src/middlewares/`): Request processing (auth, error handling, role verification).
- **Utils** (`src/utils/`): Shared utilities (password hashing, custom errors).

## Authentication Flow

**JWT stored in HTTP-only cookies:**
- Login: JWT generated and set in `accessToken` cookie (configured with `httpOnly`, `secure`, `sameSite` based on `NODE_ENV`)
- Protected routes: Use `passportCall("jwt", { session: false })` middleware which extracts JWT from cookie
- Passport strategy: `src/middlewares/passport/passport-jwt-cookies.js` configures JWT extraction from cookies
- Cookie configuration: `secure: true` and `sameSite: "none"` in production, `secure: false` and `sameSite: "lax"` in development

**Passport Integration:**
- Custom `passportCall` wrapper (`src/middlewares/passport/passport-call.js`) wraps passport.authenticate to work with Express async/await pattern
- Returns 401 with error message if authentication fails

## Key Patterns

**Error Handling:**
- Use `CustomError` class (`src/utils/custom-error.js`) with status codes: `throw new CustomError(message, statusCode)`
- Controllers wrap service calls in try/catch and pass errors to `next(error)`
- Global error handler (`src/middlewares/errorHandler.js`) catches all errors and formats responses

**DAO Pattern:**
- All DAOs extend `MongoDao` base class for standard CRUD
- Specialized DAOs (e.g., `UserDao`) add domain-specific methods (e.g., `getUserByEmail`)
- DAOs are instantiated with their model and exported as singletons

**Controller/Service Injection:**
- Controllers and Services are instantiated as classes
- Dependencies injected via constructor (e.g., `AuthController` receives `authService`)
- Exported as singleton instances (e.g., `export const authController = new AuthController(authService)`)

**Route Organization:**
- Main router: `src/routes/index.js` aggregates all route modules under `/api`
- Public routes: `/api/auth` (register, login, logout)
- Protected routes: `/api/users` (requires JWT via `passportCall`)

## Important Files

**Entry point:** `src/app.js` - Initializes Express, configures middlewares, connects routes, starts server

**Database:** `src/config/db.js` - Mongoose connection setup

**Role verification:** `src/middlewares/verifyRole.js` - Restricts access to admin-only routes

**Password utilities:** `src/utils/user-utils.js` - `createHash()`, `isValid()` for bcrypt operations

## Testing

**Framework:** Jest + Supertest

**Run tests:**
```bash
npm test              # Run all tests with verbose output
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

**Test Structure:**
- `tests/unit/services/` - Unit tests for business logic (mock all dependencies)
- `tests/integration/routes/` - Integration tests for HTTP endpoints (use supertest)
- `tests/setup.js` - Global test configuration (env vars, hooks, timeout)

**Key Testing Patterns:**
- Unit tests: Mock repositories/DAOs, test service logic in isolation
- Integration tests: Use supertest to make HTTP requests without starting server
- For protected routes: First POST to `/api/auth/login` to get cookie, then use it in subsequent requests
- Clean up after each test: `afterEach(() => jest.clearAllMocks())`
- Use AAA pattern: Arrange → Act → Assert

**Configuration:**
- `jest.config.js` configured for ES modules with `NODE_OPTIONS=--experimental-vm-modules`
- Coverage threshold: 50% (configurable in jest.config.js)
- Test timeout: 10 seconds (sufficient for DB operations)
- Coverage excludes: entry point, DB config, Mongoose models

## Development Notes

- All imports use ES module syntax with `.js` extensions
- Database models use Mongoose schemas with strict typing and validation
- User model includes `resetToken` and `resetTokenExp` fields for password recovery flow
- CORS is configured for single origin - update `app.js` if frontend URL changes
