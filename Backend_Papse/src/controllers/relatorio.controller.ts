import { type Request, type Response } from "express";
import {
  createRelatorioService,
  getRelatoriosByPacienteService,
} from "../services/relatorio.service.js";
import { verificarVinculoService } from "../services/vinculo.service.js";

export const createRelatorio = async (req: Request, res: Response) => {
  try {
    const { idPaciente, idBolsista, texto } = req.body;

    if (!idPaciente || !idBolsista || !texto) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    if (req.user && req.user.role === "BOLSISTA") {
      const temVinculo = await verificarVinculoService(Number(idPaciente), req.user.id);
      if (!temVinculo) {
        return res.status(403).json({ message: "Acesso negado: Paciente não vinculado a este bolsista." });
      }
    }

    const novoRelatorio = await createRelatorioService(
      Number(idPaciente),
      Number(idBolsista),
      texto,
    );

    return res.status(201).json(novoRelatorio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getRelatorios = async (req: Request, res: Response) => {
  try {
    const { idPaciente } = req.params;

    if (!idPaciente) {
      return res.status(400).json({ message: "ID do paciente é obrigatório." });
    }

    if (req.user && req.user.role === "BOLSISTA") {
      const temVinculo = await verificarVinculoService(Number(idPaciente), req.user.id);
      if (!temVinculo) {
        return res.status(403).json({ message: "Acesso negado: Paciente não vinculado a este bolsista." });
      }
    }

    const relatorios = await getRelatoriosByPacienteService(Number(idPaciente));
    return res.status(200).json(relatorios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};
