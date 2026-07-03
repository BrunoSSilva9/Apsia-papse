import { type Request, type Response, type NextFunction } from "express";
import { ProtocoloService } from "../services/protocolo.service.js";
import { AppError } from "../errors/AppError.js";

export class ProtocoloController {
  private protocoloService = new ProtocoloService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipRaw = req.ip || req.socket?.remoteAddress;
      const reqUser = req.user
        ? { id: req.user.id, role: req.user.role as string, ...(ipRaw ? { ip: ipRaw } : {}) }
        : undefined;
      const novoProtocolo = await this.protocoloService.create(req.body, reqUser);
      res.status(201).json({ success: true, data: novoProtocolo, message: "Protocolo criado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrado")) return next(new AppError(error.message, 404));
      if (error.message?.includes("já está") || error.message?.includes("já tem")) return next(new AppError(error.message, 409));
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const protocolos = await this.protocoloService.findAll();
      res.status(200).json({ success: true, data: protocolos, message: "Protocolos recuperados com sucesso." });
    } catch (error: any) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      const protocolo = await this.protocoloService.findOne(id);
      res.status(200).json({ success: true, data: protocolo, message: "Protocolo recuperado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrado")) return next(new AppError(error.message, 404));
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
      const protocolo = await this.protocoloService.update(id, req.body);
      res.status(200).json({ success: true, data: protocolo, message: "Protocolo atualizado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrado")) return next(new AppError(error.message, 404));
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
      await this.protocoloService.delete(id, reqUser);
      res.status(204).send();
    } catch (error: any) {
      if (error.message?.includes("não encontrado")) return next(new AppError(error.message, 404));
      next(error);
    }
  };
}
