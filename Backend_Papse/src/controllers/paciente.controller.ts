import { type Request, type Response } from "express";
import { PacienteService } from "../services/paciente.service.js";
import axios from "axios";

export class PacienteController {
  private pacienteService = new PacienteService();

  public create = async (req: Request, res: Response) => {
    try {
      const { recaptchaToken, ...dadosPaciente } = req.body;
      if (!recaptchaToken) {
        return res
          .status(403)
          .json({ message: "Falha de segurança: Token do reCAPTCHA ausente." });
      }

      const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

      const googleResponse = await axios.post(googleVerifyUrl);
      const { success, score } = googleResponse.data;

      if (!success || score < 0.5) {
        console.warn(`Tentativa de bot bloqueada. Score: ${score}`);
        return res
          .status(403)
          .json({ message: "Acesso negado por atividade suspeita (Bot)." });
      }

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
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  };

  public findAll = async (req: Request, res: Response) => {
    try {
      if (req.user && req.user.role === "BOLSISTA") {
        const { prisma } = await import("../lib/prisma.js");
        
        const idsVinculados = new Set<number>();
        
        const protocolos = await prisma.protocolo.findMany({ where: { idBolsista: req.user.id }, select: { idPaciente: true } });
        protocolos.forEach(p => idsVinculados.add(p.idPaciente));
        
        const regulares = await prisma.regular.findMany({ where: { idBolsista: req.user.id }, select: { idPaciente: true } });
        regulares.forEach(r => idsVinculados.add(r.idPaciente));
        
        const listaRegulares = await prisma.listaRegular.findMany({ where: { idBolsista: req.user.id }, select: { idPaciente: true } });
        listaRegulares.forEach(lr => idsVinculados.add(lr.idPaciente));
        
        const pacientes = await this.pacienteService.findAll();
        const pacientesFiltrados = pacientes.filter(p => idsVinculados.has(p.idPaciente));
        return res.status(200).json(pacientesFiltrados);
      }

      const pacientes = await this.pacienteService.findAll();
      res.status(200).json(pacientes);
    } catch (error: any) {
      res.status(500).json({ message: "Erro interno do servidor." });
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

      if (req.user && req.user.role === "BOLSISTA") {
        const { verificarVinculoService } = await import("../services/vinculo.service.js");
        const temVinculo = await verificarVinculoService(parseInt(id, 10), req.user.id);
        if (!temVinculo) {
          return res.status(403).json({ message: "Acesso negado: Paciente não vinculado a este bolsista." });
        }
      }

      const ipValue = req.ip || req.socket.remoteAddress;
      const reqUser = req.user
        ? {
            id: req.user.id,
            role: req.user.role as string,
            ...(ipValue ? { ip: ipValue } : {}),
          }
        : undefined;

      const paciente = await this.pacienteService.findOne(parseInt(id, 10), reqUser);
      res.status(200).json(paciente);
    } catch (error: any) {
      if (error.message === "Paciente não encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro interno do servidor." });
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

      if (req.user && req.user.role === "BOLSISTA") {
        const { verificarVinculoService } = await import("../services/vinculo.service.js");
        const temVinculo = await verificarVinculoService(parseInt(id, 10), req.user.id);
        if (!temVinculo) {
          return res.status(403).json({ message: "Acesso negado: Paciente não vinculado a este bolsista." });
        }
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
      res.status(500).json({ message: "Erro interno do servidor." });
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

      const ipValue = req.ip || req.socket.remoteAddress;
      const reqUser = req.user
        ? {
            id: req.user.id,
            role: req.user.role as string,
            ...(ipValue ? { ip: ipValue } : {}),
          }
        : undefined;

      await this.pacienteService.delete(parseInt(id, 10), reqUser);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Paciente não encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  };
}
