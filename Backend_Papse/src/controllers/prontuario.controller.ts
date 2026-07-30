import { type Request, type Response, type NextFunction } from "express";
import { getProntuarioCompletoService } from "../services/prontuario.service.js";
import { AuditService } from "../services/audit.service.js";
import { AppError } from "../errors/AppError.js";

const auditService = new AuditService();

export const getProntuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idPaciente = Number(req.params.idPaciente);

    if (!idPaciente || isNaN(idPaciente)) {
      throw new AppError("ID do paciente inválido.", 400);
    }

    const prontuario = await getProntuarioCompletoService(idPaciente);

    await auditService.log({
      ...(req.user?.id ? { idBolsista: req.user.id } : {}),
      ...(req.user?.role ? { role: req.user.role } : {}),
      acao: "EXPORTOU_PRONTUARIO",
      entidade: "Paciente",
      entidadeId: idPaciente,
      pacienteId: idPaciente,
      ...(req.ip ? { ip_origem: req.ip } : {}),
      ...(req.headers["user-agent"] ? { user_agent: req.headers["user-agent"] } : {}),
    });

    return res.status(200).json({
      success: true,
      data: prontuario,
      message: "Prontuário carregado com sucesso.",
    });
  } catch (error) {
    next(error);
  }
};
