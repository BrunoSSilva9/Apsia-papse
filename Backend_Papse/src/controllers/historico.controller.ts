import { type Request, type Response, type NextFunction } from 'express';
import { HistoricoService } from '../services/historico.service.js';
import { AppError } from '../errors/AppError.js';

export class HistoricoController {
  private historicoService = new HistoricoService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const historico = await this.historicoService.create(req.body);
      res.status(201).json({ success: true, data: historico, message: "Histórico criado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes('não encontrado')) return next(new AppError(error.message, 404));
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const historicos = await this.historicoService.findAll();
      res.status(200).json({ success: true, data: historicos, message: "Históricos recuperados com sucesso." });
    } catch (error: any) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id || "0", 10);
    try {
      const historico = await this.historicoService.findOne(id);
      res.status(200).json({ success: true, data: historico, message: "Histórico recuperado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes('não encontrad')) return next(new AppError(error.message, 404));
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id || "0", 10);
    try {
      await this.historicoService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message?.includes('não encontrad')) return next(new AppError(error.message, 404));
      next(error);
    }
  };
}