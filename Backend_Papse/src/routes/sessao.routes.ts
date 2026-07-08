import { Router } from "express";
import { createSessao, getSessoesByPaciente } from "../controllers/sessao.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSessaoSchema, paramIdPacienteSessaoSchema } from "../schemas/sessao.schema.js";

const router = Router();

router.post(
  "/sessoes",
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  validate(createSessaoSchema),
  createSessao,
);

router.get(
  "/sessoes/:idPaciente",
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  validate(paramIdPacienteSessaoSchema),
  getSessoesByPaciente,
);

export default router;
