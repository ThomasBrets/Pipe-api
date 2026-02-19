import { Router } from "express";
const router = Router();
import { productController } from "../controllers/productController.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { passportCall } from "../middlewares/passport/passport-call.js";

// RUTAS PÚBLICAS
router.get("/", productController.getAll);
router.get("/:pid", productController.getById);

// RUTAS PROTEGIDAS (solo ADMIN)
router.post("/", passportCall("jwt", { session: false }), verifyRole("ADMIN"), productController.create);
router.put("/:pid", passportCall("jwt", { session: false }), verifyRole("ADMIN"), productController.update);
router.delete("/:pid", passportCall("jwt", { session: false }), verifyRole("ADMIN"), productController.delete);

export default router;
