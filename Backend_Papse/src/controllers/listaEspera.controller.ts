import { type Request, type Response, type NextFunction } from "express";
import { ListaEsperaService } from "../services/listaEspera.service.js";
import { AppError } from "../errors/AppError.js";

export class ListaEsperaController {
  private listaEsperaService = new ListaEsperaService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const novaEntrada = await this.listaEsperaService.create(req.body);
      res.status(201).json({ success: true, data: novaEntrada, message: "Paciente adicionado à lista de espera com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrado")) return next(new AppError(error.message, 404));
      if (error.message?.includes("já está")) return next(new AppError(error.message, 409));
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listaEspera = await this.listaEsperaService.findAll();
      res.status(200).json({ success: true, data: listaEspera, message: "Lista de espera recuperada com sucesso." });
    } catch (error: any) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id || "0", 10);
    try {
      const entrada = await this.listaEsperaService.findOne(id);
      res.status(200).json({ success: true, data: entrada, message: "Registro recuperado com sucesso." });
    } catch (error: any) {
      if (error.message?.includes("não encontrad")) return next(new AppError(error.message, 404));
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id || "0", 10);
    try {
      await this.listaEsperaService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message?.includes("não encontrad")) return next(new AppError(error.message, 404));
      next(error);
    }
  };
}
