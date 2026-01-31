import { type Request, type Response } from "express";
import {
  createRelatorioService,
  getRelatoriosByPacienteService,
} from "../services/relatorio.service.js";

export const createRelatorio = async (req: Request, res: Response) => {
  try {
    const { idPaciente, idBolsista, texto } = req.body;

    if (!idPaciente || !idBolsista || !texto) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    const novoRelatorio = await createRelatorioService(
      Number(idPaciente),
      Number(idBolsista),
      texto,
    );

    return res.status(201).json(novoRelatorio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar relatório." });
  }
};

export const getRelatorios = async (req: Request, res: Response) => {
  try {
    const { idPaciente } = req.params;

    if (!idPaciente) {
      return res.status(400).json({ message: "ID do paciente é obrigatório." });
    }

    const relatorios = await getRelatoriosByPacienteService(Number(idPaciente));
    return res.status(200).json(relatorios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar relatórios." });
  }
};
