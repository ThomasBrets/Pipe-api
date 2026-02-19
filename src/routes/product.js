import { Router } from "express";
const router = Router();
import { productController } from "../controllers/productController.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { passportCall } from "../middlewares/passport/passport-call.js";

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Retorna una lista de productos. Acepta un parámetro opcional para limitar la cantidad.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad máxima de productos a retornar
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   img:
 *                     type: string
 *                   code:
 *                     type: string
 *                   stock:
 *                     type: integer
 *                   category:
 *                     type: string
 *                   status:
 *                     type: boolean
 *             example:
 *               - _id: "507f1f77bcf86cd799439011"
 *                 title: "Teclado mecánico"
 *                 description: "Teclado mecánico RGB con switches Cherry MX"
 *                 price: 89.99
 *                 img: "https://ejemplo.com/teclado.jpg"
 *                 code: "TEC-001"
 *                 stock: 50
 *                 category: "periféricos"
 *                 status: true
 */
router.get("/", productController.getAll);

/**
 * @swagger
 * /api/products/{pid}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Retorna un único producto por su ID de MongoDB
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 img:
 *                   type: string
 *                 code:
 *                   type: string
 *                 stock:
 *                   type: integer
 *                 category:
 *                   type: string
 *                 status:
 *                   type: boolean
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               title: "Teclado mecánico"
 *               description: "Teclado mecánico RGB con switches Cherry MX"
 *               price: 89.99
 *               img: "https://ejemplo.com/teclado.jpg"
 *               code: "TEC-001"
 *               stock: 50
 *               category: "periféricos"
 *               status: true
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: "Producto no encontrado"
 */
router.get("/:pid", productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     description: Crea un producto. Requiere autenticación y rol ADMIN.
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - code
 *               - stock
 *               - category
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción detallada
 *               price:
 *                 type: number
 *                 description: Precio del producto
 *               img:
 *                 type: string
 *                 description: URL de la imagen (opcional)
 *               code:
 *                 type: string
 *                 description: Código único del producto
 *               stock:
 *                 type: integer
 *                 description: Cantidad en stock
 *               category:
 *                 type: string
 *                 description: Categoría del producto
 *               status:
 *                 type: boolean
 *                 description: Si el producto está activo o no
 *           example:
 *             title: "Mouse inalámbrico"
 *             description: "Mouse ergonómico con sensor óptico de 1600 DPI"
 *             price: 34.99
 *             img: "https://ejemplo.com/mouse.jpg"
 *             code: "MOU-002"
 *             stock: 100
 *             category: "periféricos"
 *             status: true
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               _id: "507f1f77bcf86cd799439022"
 *               title: "Mouse inalámbrico"
 *               description: "Mouse ergonómico con sensor óptico de 1600 DPI"
 *               price: 34.99
 *               img: "https://ejemplo.com/mouse.jpg"
 *               code: "MOU-002"
 *               stock: 100
 *               category: "periféricos"
 *               status: true
 *       401:
 *         description: No autenticado (falta cookie accessToken)
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       403:
 *         description: Acceso denegado (no es ADMIN)
 *         content:
 *           application/json:
 *             example:
 *               message: "Acceso denegado"
 */
router.post("/", passportCall("jwt", { session: false }), verifyRole("ADMIN"), productController.create);

/**
 * @swagger
 * /api/products/{pid}:
 *   put:
 *     summary: Actualizar producto
 *     description: Actualiza los campos de un producto existente. Requiere autenticación y rol ADMIN.
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a actualizar
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               img:
 *                 type: string
 *               code:
 *                 type: string
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *               status:
 *                 type: boolean
 *           example:
 *             price: 79.99
 *             stock: 45
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               title: "Teclado mecánico"
 *               description: "Teclado mecánico RGB con switches Cherry MX"
 *               price: 79.99
 *               code: "TEC-001"
 *               stock: 45
 *               category: "periféricos"
 *               status: true
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       403:
 *         description: Acceso denegado (no es ADMIN)
 *         content:
 *           application/json:
 *             example:
 *               message: "Acceso denegado"
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: "Producto no encontrado"
 */
router.put("/:pid", passportCall("jwt", { session: false }), verifyRole("ADMIN"), productController.update);

/**
 * @swagger
 * /api/products/{pid}:
 *   delete:
 *     summary: Eliminar producto
 *     description: Elimina un producto por su ID. Requiere autenticación y rol ADMIN.
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a eliminar
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto eliminado con éxito"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       403:
 *         description: Acceso denegado (no es ADMIN)
 *         content:
 *           application/json:
 *             example:
 *               message: "Acceso denegado"
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: "Producto no encontrado"
 */
router.delete("/:pid", passportCall("jwt", { session: false }), verifyRole("ADMIN"), productController.delete);

export default router;
