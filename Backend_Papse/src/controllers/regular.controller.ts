import { type Request, type Response, type NextFunction } from "express";
import { RegularService } from "../services/regular.service.js";
import { AppError } from "../errors/AppError.js";

export class RegularController {
  private regularService = new RegularService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipRaw = req.ip || req.socket?.remoteAddress;
      const reqUser = req.user
        ? { id: req.user.id, role: req.user.role as string, ...(ipRaw ? { ip: ipRaw } : {}) }
        : undefined;
      const novoRegistro = await this.regularService.create(req.body, reqUser);
      res.status(201).json({ success: true, data: novoRegistro, message: "Atendimento regular criado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrado")) return next(new AppError(error.message, 404));
      if (error.message?.includes("já está") || error.message?.includes("já tem")) return next(new AppError(error.message, 409));
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registros = await this.regularService.findAll();
      res.status(200).json({ success: true, data: registros, message: "Registros regulares recuperados com sucesso." });
    } catch (error: any) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      const registro = await this.regularService.findOne(id);
      res.status(200).json({ success: true, data: registro, message: "Registro recuperado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrad")) return next(new AppError(error.message, 404));
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      const registroAtualizado = await this.regularService.update(id, req.body);
      res.status(200).json({ success: true, data: registroAtualizado, message: "Registro regular atualizado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrad")) return next(new AppError(error.message, 404));
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      const ipRaw = req.ip || req.socket?.remoteAddress;
      const reqUser = req.user
        ? { id: req.user.id, role: req.user.role as string, ...(ipRaw ? { ip: ipRaw } : {}) }
        : undefined;
      await this.regularService.delete(id, reqUser);
      res.status(204).send();
    } catch (error: any) {
      if (error.message?.includes("não encontrad")) return next(new AppError(error.message, 404));
      next(error);
    }
  };
}
