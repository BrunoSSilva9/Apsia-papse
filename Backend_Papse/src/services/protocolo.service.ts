import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export interface CreateProtocoloDto {
  data_inicio_atendimento: string;
  qtde_sessoes: number;
  idPaciente: number;
  idBolsista: number;
}

export interface UpdateProtocoloDto {
  data_inicio_atendimento?: string;
  qtde_sessoes?: number;
}

export class ProtocoloService {
  public async create(data: CreateProtocoloDto, reqUser?: { id: number; role: string; ip?: string }) {
    try {
      const protocolo = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          await tx.paciente.findUniqueOrThrow({
            where: { idPaciente: data.idPaciente },
          });

          await tx.colaborador.findUniqueOrThrow({
            where: { idBolsista: data.idBolsista },
          });

          // Remover da lista de espera se estiver lá
          await tx.listaEspera.deleteMany({
            where: { idPaciente: data.idPaciente },
          });

          const novoProtocolo = await tx.protocolo.create({
            data: {
              qtde_sessoes: data.qtde_sessoes,
              data_inicio_atendimento: new Date(data.data_inicio_atendimento),
              idPaciente: data.idPaciente,
              idBolsista: data.idBolsista,
            },
          });
          return novoProtocolo;
        }
      );

      if (reqUser) {
        const { AuditService } = await import("./audit.service.js");
        const audit = new AuditService();
        await audit.log({
          idBolsista: reqUser.id,
          role: reqUser.role as any,
          acao: "CRIAR_PROTOCOLO",
          entidade: "Protocolo",
          entidadeId: protocolo.idProtocolo,
          pacienteId: data.idPaciente,
          ...(reqUser.ip ? { ip_origem: reqUser.ip } : {}),
        });
      }

      return protocolo;
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error("Paciente ou Colaborador não encontrado.");
      }
      console.error("Erro ao criar protocolo:", error);
      throw new Error("Não foi possível criar o protocolo.");
    }
  }

  public async findAll() {
    try {
      const protocolos = await prisma.protocolo.findMany({
        include: {
          paciente: true,
          colaborador: true,
        },
      });
      return protocolos;
    } catch (error) {
      console.error("Erro ao buscar protocolos:", error);
      throw new Error("Não foi possível buscar os protocolos.");
    }
  }

  public async findOne(id: number) {
    try {
      const protocolo = await prisma.protocolo.findUniqueOrThrow({
        where: { idProtocolo: id },
        include: {
          paciente: true,
          colaborador: true,
        },
      });
      return protocolo;
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error("Protocolo não encontrado.");
      }
      console.error("Erro ao buscar protocolo:", error);
      throw new Error("Não foi possível buscar o protocolo.");
    }
  }

  public async update(id: number, data: UpdateProtocoloDto) {
    try {
      const protocolo = await prisma.protocolo.update({
        where: { idProtocolo: id },
        data: {
          ...data,
          ...(data.data_inicio_atendimento && {
            data_inicio_atendimento: new Date(data.data_inicio_atendimento),
          }),
        },
      });
      return protocolo;
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error("Protocolo não encontrado para atualizar.");
      }
      console.error("Erro ao atualizar protocolo:", error);
      throw new Error("Não foi possível atualizar o protocolo.");
    }
  }

  async delete(id: number, reqUser?: { id: number; role: string; ip?: string }) {
    try {
      const protocoloParaArquivar = await prisma.protocolo.findUniqueOrThrow({
        where: { idProtocolo: id },
      });

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.protocolo.delete({
          where: { idProtocolo: id },
        });

        await tx.historico.create({
          data: {
            idPaciente: protocoloParaArquivar.idPaciente,
            id_ultimo_bolsista: protocoloParaArquivar.idBolsista,
            data_desligamento: new Date(),
          },
        });
      });

      if (reqUser) {
        const { AuditService } = await import("./audit.service.js");
        const audit = new AuditService();
        await audit.log({
          idBolsista: reqUser.id,
          role: reqUser.role as any,
          acao: "ARQUIVAR_PROTOCOLO",
          entidade: "Protocolo",
          entidadeId: id,
          pacienteId: protocoloParaArquivar.idPaciente,
          ...(reqUser.ip ? { ip_origem: reqUser.ip } : {}),
        });
      }
    } catch (error: any) {
      if (error.code === "P2025" || error.message.includes("não encontrado")) {
        throw new Error("Registro de protocolo não encontrado.");
      }
      console.error(
        `Erro ao arquivar registro do protocolo com ID ${id}:`,
        error
      );
      throw new Error("Não foi possível arquivar o registro.");
    }
  }
}
