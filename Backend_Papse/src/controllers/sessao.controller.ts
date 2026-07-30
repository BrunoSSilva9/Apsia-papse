import { type Request, type Response, type NextFunction } from "express";
import { createSessaoService, getSessoesByPacienteService } from "../services/sessao.service.js";
import { verificarVinculoService } from "../services/vinculo.service.js";
import { AppError } from "../errors/AppError.js";
import { AuditService } from "../services/audit.service.js";
import { StatusSessao } from "@prisma/client";

const auditService = new AuditService();

export const createSessao = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPaciente, idBolsista, status } = req.body;

    if (req.user && req.user.role === "BOLSISTA") {
      const temVinculo = await verificarVinculoService(Number(idPaciente), req.user.id);
      if (!temVinculo) {
        throw new AppError("Acesso negado: Paciente nao vinculado a este bolsista.", 403);
      }
    }

    const sessao = await createSessaoService({
      ...req.body,
      idPaciente: Number(idPaciente),
      idBolsista: Number(idBolsista),
    });

    const acaoAuditoria =
      status === StatusSessao.REALIZADA
        ? "CRIOU_SESSAO"
        : status === StatusSessao.CANCELADA
        ? "REGISTROU_CANCELAMENTO"
        : "REGISTROU_FALTA";

    await auditService.log({
      ...(req.user?.id ? { idBolsista: req.user.id } : {}),
      ...(req.user?.role ? { role: req.user.role } : {}),
      acao: acaoAuditoria,
      entidade: "Sessao",
      entidadeId: sessao.idSessao,
      pacienteId: Number(idPaciente),
      ...(req.ip ? { ip_origem: req.ip } : {}),
      ...(req.headers["user-agent"] ? { user_agent: req.headers["user-agent"] } : {}),
    });

    return res.status(201).json({
      success: true,
      data: sessao,
      message: "Sessao registrada com sucesso.",
    });
  } catch (error) {
    next(error);
  }
};

export const getSessoesByPaciente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPaciente } = req.params;

    if (!idPaciente) {
      throw new AppError("ID do paciente e obrigatorio.", 400);
    }

    if (req.user && req.user.role === "BOLSISTA") {
      const temVinculo = await verificarVinculoService(Number(idPaciente), req.user.id);
      if (!temVinculo) {
        throw new AppError("Acesso negado: Paciente nao vinculado a este bolsista.", 403);
      }
    }

    const sessoes = await getSessoesByPacienteService(Number(idPaciente));

    return res.status(200).json({
      success: true,
      data: sessoes,
      message: "Sessoes carregadas com sucesso.",
    });
  } catch (error) {
    next(error);
  }
};
