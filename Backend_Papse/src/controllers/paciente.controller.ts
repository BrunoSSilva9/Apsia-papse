import { type Request, type Response, type NextFunction } from "express";
import { PacienteService } from "../services/paciente.service.js";
import axios from "axios";
import { AppError } from "../errors/AppError.js";

export class PacienteController {
  private pacienteService = new PacienteService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { recaptchaToken, ...dadosPaciente } = req.body;
      if (process.env.NODE_ENV !== "development" && process.env.RECAPTCHA_SECRET_KEY !== "chave_local_de_teste") {
        if (!recaptchaToken) {
          throw new AppError("Falha de segurança: Token do reCAPTCHA ausente.", 403);
        }

        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

        const googleResponse = await axios.post(googleVerifyUrl);
        const { success, score } = googleResponse.data;

        if (!success || score < 0.5) {
          console.warn(`Tentativa de bot bloqueada. Score: ${score}`);
          throw new AppError("Acesso negado por atividade suspeita (Bot).", 403);
        }
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
      res.status(201).json({
        success: true,
        data: novoPaciente,
        message: "Paciente criado com sucesso."
      });
    } catch (error: any) {
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (req.user && req.user.role === "BOLSISTA") {
        const { verificarVinculoService } = await import("../services/vinculo.service.js");
        const temVinculo = await verificarVinculoService(parseInt(id as string, 10), req.user.id);
        if (!temVinculo) {
          throw new AppError("Acesso negado: Paciente não vinculado a este bolsista.", 403);
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

      const paciente = await this.pacienteService.findOne(parseInt(id as string, 10), reqUser);
      res.status(200).json(paciente);
    } catch (error: any) {
      if (error.message === "Paciente não encontrado.") {
        return next(new AppError(error.message, 404));
      }
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (req.user && req.user.role === "BOLSISTA") {
        const { verificarVinculoService } = await import("../services/vinculo.service.js");
        const temVinculo = await verificarVinculoService(parseInt(id as string, 10), req.user.id);
        if (!temVinculo) {
          throw new AppError("Acesso negado: Paciente não vinculado a este bolsista.", 403);
        }
      }

      const pacienteAtualizado = await this.pacienteService.update(
        parseInt(id as string, 10),
        req.body,
      );
      res.status(200).json({
        success: true,
        data: pacienteAtualizado,
        message: "Paciente atualizado com sucesso."
      });
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        return next(new AppError(error.message, 404));
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
            role: req.user.role as string,
            ...(ipValue ? { ip: ipValue } : {}),
          }
        : undefined;

      await this.pacienteService.delete(parseInt(id as string, 10), reqUser);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Paciente não encontrado.") {
        return next(new AppError(error.message, 404));
      }
      next(error);
    }
  };
}
