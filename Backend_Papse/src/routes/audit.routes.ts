import { Router, type Request, type Response, type NextFunction } from "express";
import { AuditController } from "../controllers/audit.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { Role } from "@prisma/client";

const router = Router();
const auditController = new AuditController();

router.get(
  "/",
  authMiddleware,
  checkRole([Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => auditController.findAll(req, res, next)
);

export default router;
