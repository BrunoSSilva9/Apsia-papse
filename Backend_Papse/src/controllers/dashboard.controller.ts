import { type Request, type Response, type NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service.js";

const dashboardService = new DashboardService();

export class DashboardController {
  public getMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const metrics = await dashboardService.getMetrics();

      res.status(200).json({
        success: true,
        data: metrics,
        message: "Métricas do dashboard recuperadas com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  };
}
