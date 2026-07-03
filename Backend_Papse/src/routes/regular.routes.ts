import { Router } from "express";
import { RegularController } from "../controllers/regular.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { paramIdSchema } from "../schemas/paramId.schema.js";
import { createRegularSchema, updateRegularSchema } from "../schemas/regular.schema.js";

const router = Router();
const regularController = new RegularController();

router.post("/regular", authMiddleware, checkRole(["ADMIN"]), validate(createRegularSchema), regularController.create);
router.get("/regular", authMiddleware, checkRole(["ADMIN", "BOLSISTA"]), regularController.findAll);
router.get("/regular/:id", authMiddleware, checkRole(["ADMIN"]), validate(paramIdSchema), regularController.findOne);
router.put("/regular/:id", authMiddleware, checkRole(["ADMIN"]), validate(updateRegularSchema), regularController.update);
router.delete("/regular/:id", authMiddleware, checkRole(["ADMIN"]), validate(paramIdSchema), regularController.delete);

export default router;
