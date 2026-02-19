import { Router } from "express";
const router = Router()
import { cartController } from "../controllers/cartController.js";

/**
 * @swagger
 * /api/users/carts:
 *   post:
 *     summary: Crear un nuevo carrito
 *     description: Crea un carrito vacío. Requiere autenticación JWT.
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Carrito creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items: {}
 *             example:
 *               message: "Carrito creado"
 *               cart:
 *                 _id: "507f1f77bcf86cd799439020"
 *                 products: []
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               error: "Error: No auth token"
 */
router.post("/", cartController.createCart);

/**
 * @swagger
 * /api/users/carts/{cid}:
 *   get:
 *     summary: Obtener carrito por ID
 *     description: Retorna el carrito con sus productos populados (título, precio, etc.)
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del carrito (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439020"
 *     responses:
 *       200:
 *         description: Carrito con productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: object
 *                         description: Producto populado con todos sus campos
 *                       quantity:
 *                         type: integer
 *             example:
 *               _id: "507f1f77bcf86cd799439020"
 *               products:
 *                 - product:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     title: "Teclado mecánico"
 *                     price: 89.99
 *                     code: "TEC-001"
 *                   quantity: 2
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               error: "Error: No auth token"
 *       404:
 *         description: Carrito no encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: "Carrito no encontrado"
 */
router.get("/:cid", cartController.getCart);

/**
 * @swagger
 * /api/users/carts/{cid}/products/{pid}:
 *   post:
 *     summary: Agregar producto al carrito
 *     description: Agrega un producto al carrito. Si ya existe, incrementa la cantidad.
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del carrito
 *         example: "507f1f77bcf86cd799439020"
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad a agregar
 *           example:
 *             quantity: 2
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto agregado al carrito"
 *               cart:
 *                 _id: "507f1f77bcf86cd799439020"
 *                 products:
 *                   - product: "507f1f77bcf86cd799439011"
 *                     quantity: 2
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               error: "Error: No auth token"
 *       404:
 *         description: Carrito no encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: "Carrito no encontrado"
 */
router.post("/:cid/products/:pid", cartController.addProduct);

/**
 * @swagger
 * /api/users/carts/{cid}/purchase:
 *   post:
 *     summary: Finalizar compra
 *     description: Procesa la compra del carrito, envía email de confirmación y vacía el carrito.
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del carrito a comprar
 *         example: "507f1f77bcf86cd799439020"
 *     responses:
 *       200:
 *         description: Compra procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 purchase:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     total:
 *                       type: number
 *             example:
 *               message: "Compra exitosa"
 *               purchase:
 *                 message: "Compra realizada con éxito. Se envió un correo de confirmación."
 *                 total: 179.98
 *       400:
 *         description: El carrito está vacío
 *         content:
 *           application/json:
 *             example:
 *               message: "El carrito esta vacío"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               error: "Error: No auth token"
 */
router.post("/:cid/purchase", cartController.purchaseCart);

/**
 * @swagger
 * /api/users/carts/{cid}/products/{pid}:
 *   delete:
 *     summary: Quitar producto del carrito
 *     description: Elimina un producto específico del carrito.
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del carrito
 *         example: "507f1f77bcf86cd799439020"
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a eliminar
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto eliminado"
 *               cart:
 *                 _id: "507f1f77bcf86cd799439020"
 *                 products: []
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               error: "Error: No auth token"
 *       404:
 *         description: Carrito no encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: "Carrito no encontrado"
 */
router.delete("/:cid/products/:pid", cartController.removeProduct);

/**
 * @swagger
 * /api/users/carts/{cid}:
 *   delete:
 *     summary: Vaciar carrito
 *     description: Elimina todos los productos del carrito (el carrito sigue existiendo, solo queda vacío).
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del carrito a vaciar
 *         example: "507f1f77bcf86cd799439020"
 *     responses:
 *       200:
 *         description: Carrito vaciado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Carrito vaciado"
 *               cart:
 *                 _id: "507f1f77bcf86cd799439020"
 *                 products: []
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             example:
 *               error: "Error: No auth token"
 *       404:
 *         description: Carrito no encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: "Carrito no encontrado"
 */
router.delete("/:cid", cartController.clearCart);

router.put("/:cid/products/:pid", cartController.updateProductQuantity);
router.put("/:cid", cartController.replaceProducts);

export default router;
