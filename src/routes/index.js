import express, { Router } from "express";
const router = Router();
import { passportCall } from "../middlewares/passport/passport-call.js";

import user from "./user.js";
import auth from "./auth.js";

router.use("/auth", auth);

router.use("/users", passportCall("jwt", { session: false }), user);





export default router;
