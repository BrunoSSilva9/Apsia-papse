import { Router } from "express";
import { getProntuario } from "../controllers/prontuario.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";

const router = Router();

router.get(
  "/prontuario/:idPaciente",
  authMiddleware,
  checkRole(["ADMIN"]),
  getProntuario
);

export default router;
