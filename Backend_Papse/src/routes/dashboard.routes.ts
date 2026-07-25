import { Router, type Request, type Response, type NextFunction } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRole.middleware.js";
import { Role } from "@prisma/client";

const router = Router();
const dashboardController = new DashboardController();

// GET /api/dashboard/metrics — exclusivo para ADMIN
router.get(
  "/dashboard/metrics",
  authMiddleware,
  checkRole([Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    dashboardController.getMetrics(req, res, next)
);

export default router;
