import { type Request, type Response } from "express";
import { RegularService } from "../services/regular.service.js";

export class RegularController {
  private regularService = new RegularService();

  async create(req: Request, res: Response) {
    const data = req.body;

    try {
      const novoRegistro = await this.regularService.create(data);
      return res.status(201).json(novoRegistro);
    } catch (error) {
      console.error("Erro ao criar registro regular:", error);
      return res.status(500).json({ error: "Erro ao criar registro regular." });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const registros = await this.regularService.findAll();
      return res.status(200).json(registros);
    } catch (error) {
      console.error("Erro ao buscar registros regulares:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar registros regulares." });
    }
  }

  async findOne(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      const registro = await this.regularService.findOne(id);
      return res.status(200).json(registro);
    } catch (error) {
      console.error("Erro ao buscar registro regular:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar registro regular." });
    }
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = req.body;

    try {
      const registroAtualizado = await this.regularService.update(id, data);
      return res.status(200).json(registroAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar registro regular:", error);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar registro regular." });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      await this.regularService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar registro regular:", error);
      return res
        .status(500)
        .json({ error: "Erro ao deletar registro regular." });
    }
  }
}
