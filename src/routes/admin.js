import { Router } from "express";
const router = Router();
import { adminController } from "../controllers/adminController.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { passportCall } from "../middlewares/passport/passport-call.js";

// Todas las rutas de este router requieren autenticación JWT + rol ADMIN
router.use(passportCall("jwt", { session: false }), verifyRole("ADMIN"));

router.get("/users", adminController.getUsers);
router.delete("/users/:uid", adminController.deleteUser);

export default router;
