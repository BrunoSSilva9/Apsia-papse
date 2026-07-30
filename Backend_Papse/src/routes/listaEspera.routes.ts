import { Router } from "express";
import { ListaEsperaController } from "../controllers/listaEspera.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { paramIdSchema } from "../schemas/paramId.schema.js";
import { createListaEsperaSchema } from "../schemas/listaEspera.schema.js";

const router = Router();
const listaEsperaController = new ListaEsperaController();

router.post(
  "/listaespera",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(createListaEsperaSchema),
  listaEsperaController.create
);
router.get(
  "/listaespera",
  authMiddleware,
  checkRole(["ADMIN"]),
  listaEsperaController.findAll
);
router.get(
  "/listaespera/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  listaEsperaController.findOne
);
router.delete(
  "/listaespera/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  listaEsperaController.delete
);

export default router;
