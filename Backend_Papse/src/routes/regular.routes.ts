import { Router } from "express";
import { RegularController } from "../controllers/regular.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";

const router = Router();
const regularController = new RegularController();

router.post("/regular", authMiddleware, checkRole(["ADMIN"]), (req, res) =>
  regularController.create(req, res),
);
router.get(
  "/regular",
  authMiddleware,
  checkRole(["ADMIN", "BOLSISTA"]),
  (req, res) => regularController.findAll(req, res),
);
router.get("/regular/:id", authMiddleware, checkRole(["ADMIN"]), (req, res) =>
  regularController.findOne(req, res),
);

router.put("/regular/:id", authMiddleware, checkRole(["ADMIN"]), (req, res) =>
  regularController.update(req, res),
);

router.delete(
  "/regular/:id",
  authMiddleware,
  checkRole(["ADMIN"]),
  (req, res) => regularController.delete(req, res),
);

export default router;
