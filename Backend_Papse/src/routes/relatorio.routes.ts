import { Router } from "express";
import {
  createRelatorio,
  getRelatorios,
} from "../controllers/relatorio.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRelatorioSchema } from "../schemas/relatorio.schema.js";

const router = Router();

router.post("/", authMiddleware, checkRole(["ADMIN", "BOLSISTA"]), validate(createRelatorioSchema), createRelatorio);

router.get("/:idPaciente", authMiddleware, checkRole(["ADMIN", "BOLSISTA"]), getRelatorios);

export default router;
