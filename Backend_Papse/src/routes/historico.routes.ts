import { Router } from "express";
import { HistoricoController } from "../controllers/historico.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { paramIdSchema } from "../schemas/paramId.schema.js";
import { createHistoricoSchema } from "../schemas/historico.schema.js";

const router = Router();
const historicoController = new HistoricoController();

router.post(
  "/historico",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(createHistoricoSchema),
  historicoController.create
);
router.get(
  "/historico",
  authMiddleware,
  checkRole(["ADMIN"]),
  historicoController.findAll
);
router.get(
  "/historico/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  historicoController.findOne
);
router.delete(
  "/historico/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  historicoController.delete
);

export default router;
