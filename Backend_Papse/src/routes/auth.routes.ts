import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router = Router();
const authController = new AuthController();

router.post("/login", validate(loginSchema), authController.login);
router.post("/esqueci-senha", authController.forgotPassword);
router.post("/redefinir-senha", authController.resetPassword);

export default router;
