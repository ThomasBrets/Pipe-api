import { Router } from "express";
import { mocksController } from "../controllers/mocksController";

const router = Router()

// USERS
router.get("/users", mocksController.mocksUsers);
router.post("/users", mocksController.generateMocksUsers);

// PRODUCTS
router.get("/products", mocksController.mocksProducts);
router.post("/products", mocksController.generateMocksProducts);

export default router