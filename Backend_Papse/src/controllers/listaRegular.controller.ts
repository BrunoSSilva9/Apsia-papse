import { type Request, type Response, type NextFunction } from "express";
import { ListaRegularService } from "../services/listaRegular.service.js";
import { AppError } from "../errors/AppError.js";

export class ListaRegularController {
  private listaRegularService = new ListaRegularService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipRaw = req.ip || req.socket?.remoteAddress;
      const reqUser = req.user
        ? { id: req.user.id, role: req.user.role as string, ...(ipRaw ? { ip: ipRaw } : {}) }
        : undefined;
      const novaEntrada = await this.listaRegularService.create(req.body, reqUser);
      res.status(201).json({ success: true, data: novaEntrada, message: "Paciente adicionado à lista regular com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrado na lista de espera")) return next(new AppError(error.message, 404));
      if (error.message?.includes("já está")) return next(new AppError(error.message, 409));
      if (error.message?.includes("não existe")) return next(new AppError(error.message, 404));
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entradas = await this.listaRegularService.findAll(req.user as any);
      res.status(200).json({ success: true, data: entradas, message: "Lista regular recuperada com sucesso." });
    } catch (error: any) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      const entrada = await this.listaRegularService.findOne(id);
      res.status(200).json({ success: true, data: entrada, message: "Registro recuperado com sucesso." });
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
      await this.listaRegularService.delete(id, reqUser);
      res.status(204).send();
    } catch (error: any) {
      if (error.message?.includes("não encontrad")) return next(new AppError(error.message, 404));
      next(error);
    }
  };
}
