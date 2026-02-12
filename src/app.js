// ⚠️ IMPORTANTE: dotenv DEBE ser lo primero para cargar variables de entorno
import "dotenv/config";

import express from "express";
const app = express();
import routes from "./routes/index.js";
import db from "./config/db.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./middlewares/passport/passport-jwt-cookies.js";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());


// Configuración de CORS
app.use(
  cors({
    origin: "https://pipe-front.vercel.app", 
    credentials: true,
  })
);

// Rutas principales
app.use("/api", routes);

// Ruta base
app.get("/", (req, res) => {
  res.send("✅ Pipe API funcionando correctamente");
});

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

/**
 * Solo iniciar el servidor si NO estamos en entorno de test
 * En tests, supertest maneja el servidor internamente
 * Esto evita el warning "A worker process has failed to exit gracefully"
 */
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor levantado en puerto ${PORT}`);
  });
}

export default app;
