/**
 * Configuración de Swagger / OpenAPI
 *
 * Este archivo define la especificación OpenAPI 3.0.0 para la documentación automática
 * de la API usando Swagger UI.
 */

import swaggerJSDoc from "swagger-jsdoc";

/**
 * Opciones de configuración para swagger-jsdoc
 */
const swaggerOptions = {
  // Definición de la especificación OpenAPI
  definition: {
    openapi: "3.0.0", // Versión de OpenAPI (estándar actual)

    // Información general de la API
    info: {
      title: "Pipe E-commerce API",
      version: "1.0.0",
      description: "API REST para e-commerce con arquitectura en capas (Routes → Controllers → Services → Repositories → DAOs → Models)",
      contact: {
        name: "API Support",
      },
    },

    // Servidores donde está disponible la API
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],

    // Definir componentes reutilizables (schemas, responses, etc.)
    components: {
      // Aquí se pueden definir schemas reutilizables
      schemas: {},

      // Configuración de seguridad (cookies, JWT, etc.)
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "Cookie HTTP-only que contiene el JWT de autenticación",
        },
      },
    },
  },

  // Rutas donde buscar comentarios JSDoc para documentación
  // Lee todos los archivos .js dentro de src/routes/
  apis: ["./src/routes/*.js"],
};

/**
 * Generar la especificación OpenAPI parseando los comentarios JSDoc
 */
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
