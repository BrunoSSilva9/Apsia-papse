import { type Request, type Response } from "express";
import { PacienteService } from "../services/paciente.service.js";

export class PacienteController {
  private pacienteService = new PacienteService();

  public create = async (req: Request, res: Response) => {
    try {
      const dadosPaciente = req.body;
      const ipRaw = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const ip_origem = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw;

      const currentDate = new Date();
      const dataBrasilia = new Date(currentDate.getTime() - 3 * 60 * 60 * 1000);

      const payloadFinal = {
        ...dadosPaciente,
        termo_lgpd: true,
        data_aceite_termo: dataBrasilia,
        ip_origem: String(ip_origem || ""),
      };

      const novoPaciente = await this.pacienteService.create(payloadFinal);
      res.status(201).json(novoPaciente);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public findAll = async (req: Request, res: Response) => {
    try {
      const pacientes = await this.pacienteService.findAll();
      res.status(200).json(pacientes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public findOne = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "O ID do paciente é obrigatório." });
      }

      const paciente = await this.pacienteService.findOne(parseInt(id, 10));
      res.status(200).json(paciente);
    } catch (error: any) {
      if (error.message === "Paciente não encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "O ID do paciente é obrigatório." });
      }

      const pacienteAtualizado = await this.pacienteService.update(
        parseInt(id, 10),
        req.body,
      );
      res.status(200).json(pacienteAtualizado);
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  };

  public delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "O ID do paciente é obrigatório." });
      }

      await this.pacienteService.delete(parseInt(id, 10));
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Paciente não encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  };
}
