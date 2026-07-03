import { type Request, type Response, type NextFunction } from "express";
import {
  createRelatorioService,
  getRelatoriosByPacienteService,
} from "../services/relatorio.service.js";
import { verificarVinculoService } from "../services/vinculo.service.js";
import { AppError } from "../errors/AppError.js";

export const createRelatorio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPaciente, idBolsista, texto } = req.body;

    if (!idPaciente || !idBolsista || !texto) {
      throw new AppError("Todos os campos são obrigatórios.", 400);
    }

    if (req.user && req.user.role === "BOLSISTA") {
      const temVinculo = await verificarVinculoService(Number(idPaciente), req.user.id);
      if (!temVinculo) {
        throw new AppError("Acesso negado: Paciente não vinculado a este bolsista.", 403);
      }
    }

    const novoRelatorio = await createRelatorioService(
      Number(idPaciente),
      Number(idBolsista),
      texto,
    );

    return res.status(201).json({
      success: true,
      data: novoRelatorio,
      message: "Relatório criado com sucesso."
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatorios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPaciente } = req.params;

    if (!idPaciente) {
      throw new AppError("ID do paciente é obrigatório.", 400);
    }

    if (req.user && req.user.role === "BOLSISTA") {
      const temVinculo = await verificarVinculoService(Number(idPaciente), req.user.id);
      if (!temVinculo) {
        throw new AppError("Acesso negado: Paciente não vinculado a este bolsista.", 403);
      }
    }

    const relatorios = await getRelatoriosByPacienteService(Number(idPaciente));
    return res.status(200).json(relatorios);
  } catch (error) {
    next(error);
  }
};
