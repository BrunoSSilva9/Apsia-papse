import { type Request, type Response, type NextFunction } from "express";
import { ColaboradorService } from "../services/colaborador.service.js";
import { AppError } from "../errors/AppError.js";

export class ColaboradorController {
  private colaboradorService = new ColaboradorService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nome, matricula, email, senha, role, data_admissao } = req.body;

      let dataFormatada;
      if (typeof data_admissao === "string" && data_admissao.length === 10) {
        dataFormatada = new Date(data_admissao + "T12:00:00.000Z");
      } else {
        dataFormatada = new Date(data_admissao);
      }
      const novoColaborador = await this.colaboradorService.create({
        nome,
        matricula,
        email,
        senha,
        role,
        data_admissao: dataFormatada,
      });
      res.status(201).json({
        success: true,
        data: novoColaborador,
        message: "Colaborador criado com sucesso."
      });
    } catch (error: any) {
      if (error.message.includes("já está cadastrada") || error.message.includes("já está cadastrado")) {
        return next(new AppError(error.message, 409));
      }
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const colaboradores = await this.colaboradorService.findAll();
      res.status(200).json(colaboradores);
    } catch (error: any) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const colaborador = await this.colaboradorService.findOne(
        parseInt(id as string, 10),
      );
      res.status(200).json(colaborador);
    } catch (error: any) {
      if (error.message === "Colaborador não encontrado.") {
        return next(new AppError(error.message, 404));
      }
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const colaboradorAtualizado = await this.colaboradorService.update(
        parseInt(id as string, 10),
        req.body,
      );
      res.status(200).json({
        success: true,
        data: colaboradorAtualizado,
        message: "Colaborador atualizado com sucesso."
      });
    } catch (error: any) {
      if (error.message.includes("Colaborador não encontrado")) {
        return next(new AppError(error.message, 404));
      }
      if (error.message.includes("já está sendo utilizada") || error.message.includes("já está sendo utilizado")) {
        return next(new AppError(error.message, 409));
      }
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const ipValue = req.ip || req.socket.remoteAddress;
      const reqUser = req.user
        ? {
            id: req.user.id,
            role: req.user.role as any,
            ...(ipValue ? { ip: ipValue } : {}),
          }
        : undefined;

      await this.colaboradorService.delete(parseInt(id as string, 10), reqUser);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Colaborador não encontrado.") {
        return next(new AppError(error.message, 404));
      }
      if (error.message.includes("ainda possui pacientes ativos")) {
        return next(new AppError(error.message, 400));
      }
      next(error);
    }
  };
}
