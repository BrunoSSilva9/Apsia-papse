import { Router } from "express";
import { ProtocoloController } from "../controllers/protocolo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { paramIdSchema } from "../schemas/paramId.schema.js";
import { createProtocoloSchema, updateProtocoloSchema } from "../schemas/protocolo.schema.js";

console.log("✅ protocolo.routes.ts foi carregado");

const router = Router();
const protocoloController = new ProtocoloController();

router.post(
  "/protocolos",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(createProtocoloSchema),
  protocoloController.create
);
router.get(
  "/protocolos",
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  protocoloController.findAll
);
router.get(
  "/protocolos/:id",
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  validate(paramIdSchema),
  protocoloController.findOne
);
router.put(
  "/protocolos/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(updateProtocoloSchema),
  protocoloController.update
);
router.delete(
  "/protocolos/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  protocoloController.delete
);

export default router;
