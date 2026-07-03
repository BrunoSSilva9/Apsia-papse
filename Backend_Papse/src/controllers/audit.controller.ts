import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export class AuditController {
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const acao = req.query.acao as string;
      const entidade = req.query.entidade as string;
      const idBolsista = req.query.idBolsista ? parseInt(req.query.idBolsista as string) : undefined;
      const pacienteId = req.query.pacienteId ? parseInt(req.query.pacienteId as string) : undefined;

      const where: any = {};
      if (acao) where.acao = { contains: acao };
      if (entidade) where.entidade = { contains: entidade };
      if (idBolsista) where.idBolsista = idBolsista;
      if (pacienteId) where.pacienteId = pacienteId;

      const total = await prisma.logAuditoria.count({ where });
      const logs = await prisma.logAuditoria.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data_hora: 'desc' },
        select: {
          idLog: true,
          idBolsista: true,
          role: true,
          acao: true,
          entidade: true,
          entidadeId: true,
          pacienteId: true,
          data_hora: true,
          ip_origem: true,
          user_agent: true,
        }
      });

      const bolsistaIds = Array.from(new Set(logs.map((l: any) => l.idBolsista).filter(Boolean))) as number[];
      const pacienteIds = Array.from(new Set(logs.map((l: any) => l.pacienteId).filter(Boolean))) as number[];

      const bolsistas = await prisma.colaborador.findMany({
        where: { idBolsista: { in: bolsistaIds } },
        select: { idBolsista: true, nome: true }
      });

      const pacientes = await prisma.paciente.findMany({
        where: { idPaciente: { in: pacienteIds } },
        select: { idPaciente: true, nome: true }
      });

      const bolsistaMap = Object.fromEntries(bolsistas.map((b: any) => [b.idBolsista, b.nome]));
      const pacienteMap = Object.fromEntries(pacientes.map((p: any) => [p.idPaciente, p.nome]));

      const logsEnriquecidos = logs.map((log: any) => ({
        ...log,
        bolsistaNome: log.idBolsista ? bolsistaMap[log.idBolsista] || null : null,
        pacienteNome: log.pacienteId ? pacienteMap[log.pacienteId] || null : null,
      }));

      res.status(200).json({
        success: true,
        data: {
          logs: logsEnriquecidos,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: "Logs de auditoria recuperados com sucesso."
      });
    } catch (error: any) {
      next(error);
    }
  };
}
