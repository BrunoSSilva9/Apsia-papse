import { Router } from "express";
import { PacienteController } from "../controllers/paciente.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPacienteSchema, updatePacienteSchema } from "../schemas/paciente.schema.js";
import { paramIdSchema } from "../schemas/paramId.schema.js";
import { publicLimiter } from "../middlewares/rateLimit.middleware.js";

console.log("✅ paciente.routes.ts foi carregado");

const router = Router();
const pacienteController = new PacienteController();

router.post(
  "/pacientes", /*
  authMiddleware,
  checkRole(["ADMIN"]),*/
  publicLimiter,
  validate(createPacienteSchema),
  pacienteController.create
);
router.get(
  "/pacientes", /*
  authMiddleware,
  checkRole(["ADMIN"]),*/
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  pacienteController.findAll
);
router.get(
  "/pacientes/:id", /*
  authMiddleware,
  checkRole(["ADMIN"]),*/
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  validate(paramIdSchema),
  pacienteController.findOne
);
router.put(
  "/pacientes/:id", /*
  authMiddleware,
  checkRole(["ADMIN"]),*/
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  validate(updatePacienteSchema),
  pacienteController.update
);
router.delete(
  "/pacientes/:id", /*
  authMiddleware,
  checkRole(["ADMIN"]),*/
  authMiddleware,
  checkRole(["ADMIN"]), // Delete continua só para ADMIN
  validate(paramIdSchema),
  pacienteController.delete
);

export default router;
