import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { loginLimiter, publicLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();
const authController = new AuthController();

router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/esqueci-senha", publicLimiter, authController.forgotPassword);
router.post("/redefinir-senha", publicLimiter, authController.resetPassword);

export default router;
