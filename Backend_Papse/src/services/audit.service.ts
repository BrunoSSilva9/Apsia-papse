import { prisma } from "../lib/prisma.js";
import { Role } from "@prisma/client";

export interface CreateAuditLogDto {
  idBolsista?: number;
  role?: Role;
  acao: string;
  entidade: string;
  entidadeId?: number;
  pacienteId?: number;
  ip_origem?: string;
  user_agent?: string;
}

export class AuditService {
  async log(data: CreateAuditLogDto) {
    try {
      await prisma.logAuditoria.create({
        data: {
          acao: data.acao,
          entidade: data.entidade,
          ...(data.idBolsista ? { idBolsista: data.idBolsista } : {}),
          ...(data.role ? { role: data.role } : {}),
          ...(data.entidadeId ? { entidadeId: data.entidadeId } : {}),
          ...(data.pacienteId ? { pacienteId: data.pacienteId } : {}),
          ...(data.ip_origem ? { ip_origem: data.ip_origem } : {}),
          ...(data.user_agent ? { user_agent: data.user_agent } : {}),
        },
      });
    } catch (error) {
      console.error("Erro interno ao gravar log de auditoria:", error);
      // Não repassa o erro para não quebrar o fluxo principal da aplicação
    }
  }
}
