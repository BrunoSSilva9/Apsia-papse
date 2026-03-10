import { type Request, type Response } from "express";
import { ColaboradorService } from "../services/colaborador.service.js";

export class ColaboradorController {
  private colaboradorService = new ColaboradorService();

  public create = async (req: Request, res: Response) => {
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
      res.status(201).json(novoColaborador);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public findAll = async (req: Request, res: Response) => {
    try {
      const colaboradores = await this.colaboradorService.findAll();
      res.status(200).json(colaboradores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public findOne = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "O ID do colaborador é obrigatório." });
    }

    try {
      const colaborador = await this.colaboradorService.findOne(
        parseInt(id, 10),
      );
      res.status(200).json(colaborador);
    } catch (error: any) {
      if (error.message === "Colaborador não encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "O ID do colaborador é obrigatório." });
    }

    try {
      const colaboradorAtualizado = await this.colaboradorService.update(
        parseInt(id, 10),
        req.body,
      );
      res.status(200).json(colaboradorAtualizado);
    } catch (error: any) {
      if (error.message.includes("Colaborador não encontrado")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  };

  public delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "O ID do colaborador é obrigatório." });
    }

    try {
      await this.colaboradorService.delete(parseInt(id, 10));
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Colaborador não encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  };
}
