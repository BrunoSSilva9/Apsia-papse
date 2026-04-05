import { Router } from "express";
import { ColaboradorController } from "../controllers/colaborador.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";

const router = Router();
const colaboradorController = new ColaboradorController();

router.post("/colaboradores", colaboradorController.create);

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
  colaboradorController.findOne,
);
router.put(
  "/colaboradores/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  colaboradorController.update,
);
router.delete(
  "/colaboradores/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  colaboradorController.delete,
);

export default router;
