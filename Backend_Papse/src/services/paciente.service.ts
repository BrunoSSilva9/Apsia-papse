import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export interface CreatePacienteDto {
  nome: string;
  email: string;
  matricula: string;
  data_nascimento: Date;
  data_inscricao: Date;
  telefone?: string;
  relato?: string;
  curso?: string;
}

export type UpdatePacienteDto = Partial<CreatePacienteDto>;
export class PacienteService {
  async create(data: CreatePacienteDto) {
    try {
      const novoPaciente = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const paciente = await tx.paciente.create({
            data: {
              ...data,
              data_nascimento: new Date(data.data_nascimento),
              data_inscricao: new Date(data.data_inscricao),
            },
          });

          await tx.listaEspera.create({
            data: {
              idPaciente: paciente.idPaciente,
            },
          });

          return paciente;
        },
      );
      return novoPaciente;
    } catch (error) {
      console.error(
        "Erro ao criar paciente e adicionar à lista de espera:",
        error,
      );

      throw new Error(
        "Não foi possível criar o paciente e adicioná-lo à lista de espera.",
      );
    }
  }

  async findAll() {
    try {
      const pacientes = await prisma.paciente.findMany({
        where: { ativo: true },
        select: {
          idPaciente: true,
          nome: true,
          matricula: true,
          data_inscricao: true,
          ativo: true,
        }
      });
      return pacientes;
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      throw new Error("Não foi possível buscar os pacientes.");
    }
  }

  async findOne(id: number, reqUser?: { id: number; role: string; ip?: string }) {
    try {
      const paciente = await prisma.paciente.findUniqueOrThrow({
        where: { idPaciente: id, ativo: true },
      });

      if (reqUser) {
        const { AuditService } = await import("./audit.service.js");
        const audit = new AuditService();
        await audit.log({
          idBolsista: reqUser.id,
          role: reqUser.role as any,
          acao: "VISUALIZAR_PACIENTE",
          entidade: "Paciente",
          entidadeId: id,
          pacienteId: id,
          ...(reqUser.ip ? { ip_origem: reqUser.ip } : {}),
        });
      }

      return paciente;
    } catch (error) {
      console.error(`Erro ao buscar paciente com ID ${id}:`, error);
      throw new Error("Paciente não encontrado.");
    }
  }

  async update(id: number, data: UpdatePacienteDto) {
    try {
      const paciente = await prisma.paciente.update({
        where: { idPaciente: id },

        data: {
          ...data,
          ...(data.data_nascimento && {
            data_nascimento: new Date(data.data_nascimento),
          }),
          ...(data.data_inscricao && {
            data_inscricao: new Date(data.data_inscricao),
          }),
        },
      });

      return paciente;
    } catch (error) {
      console.error(`Erro ao atualizar paciente com ID ${id}:`, error);
      throw new Error("Paciente não encontrado ou dados inválidos.");
    }
  }

  async delete(id: number, reqUser?: { id: number; role: string; ip?: string }) {
    try {
      await prisma.paciente.update({
        where: { idPaciente: id },
        data: {
          ativo: false,
          deletedAt: new Date(),
        },
      });

      if (reqUser) {
        const { AuditService } = await import("./audit.service.js");
        const audit = new AuditService();
        await audit.log({
          idBolsista: reqUser.id,
          role: reqUser.role as any,
          acao: "INATIVAR_PACIENTE",
          entidade: "Paciente",
          entidadeId: id,
          pacienteId: id,
          ...(reqUser.ip ? { ip_origem: reqUser.ip } : {}),
        });
      }
    } catch (error) {
      console.error(`Erro ao deletar paciente com ID ${id}:`, error);
      throw new Error("Paciente não encontrado.");
    }
  }
}
