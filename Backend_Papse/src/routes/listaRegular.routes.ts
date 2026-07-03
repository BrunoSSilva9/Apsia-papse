import { Router } from "express";
import { ListaRegularController } from "../controllers/listaRegular.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { paramIdSchema } from "../schemas/paramId.schema.js";
import { createListaRegularSchema } from "../schemas/listaRegular.schema.js";

const router = Router();
const listaRegularController = new ListaRegularController();

router.post(
  "/listaregular",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(createListaRegularSchema),
  listaRegularController.create
);
router.get(
  "/listaregular",
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  listaRegularController.findAll
);
router.get(
  "/listaregular/:id",
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  validate(paramIdSchema),
  listaRegularController.findOne
);
router.delete(
  "/listaregular/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  validate(paramIdSchema),
  listaRegularController.delete
);

export default router;
