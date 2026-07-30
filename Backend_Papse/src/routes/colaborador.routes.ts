import { Router } from "express";
import { ColaboradorController } from "../controllers/colaborador.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createColaboradorSchema,
  updateColaboradorSchema,
} from "../schemas/colaborador.schema.js";
import { paramIdSchema } from "../schemas/paramId.schema.js";

const router = Router();
const colaboradorController = new ColaboradorController();

router.post(
  "/colaboradores",
  validate(createColaboradorSchema),
  colaboradorController.create
);

router.get(
  "/colaboradores",
  authMiddleware,
  checkRole(["ADMIN"]),
  colaboradorController.findAll,
);
router.get(
  "/colaboradores/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  colaboradorController.findOne,
);
router.put(
  "/colaboradores/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(updateColaboradorSchema),
  colaboradorController.update,
);
router.delete(
  "/colaboradores/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  colaboradorController.delete,
);

export default router;
