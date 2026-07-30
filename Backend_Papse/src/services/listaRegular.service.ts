import { prisma } from "../lib/prisma.js";
import { Prisma, Role } from "@prisma/client";

interface UsuarioLogado {
  id: number;
  role: Role;
}

export interface CreateListaRegularDto {
  idPaciente: number;
  idBolsista: number;
}

export class ListaRegularService {
  async create(data: CreateListaRegularDto, reqUser?: { id: number; role: string; ip?: string }) {
    try {
      const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const pacienteEmEspera = await tx.listaEspera.findFirst({
          where: { idPaciente: data.idPaciente },
        });

        if (!pacienteEmEspera) {
          throw new Error("Paciente não encontrado na lista de espera.");
        }

        await tx.colaborador.findUniqueOrThrow({
          where: { idBolsista: data.idBolsista },
        });

        // Anti-duplicata: verificar se já está na ListaRegular
        const jaExiste = await tx.listaRegular.findFirst({
          where: { idPaciente: data.idPaciente },
        });
        if (jaExiste) {
          throw new Error("Paciente já está na lista regular.");
        }

        const novoRegistro = await tx.listaRegular.create({
          data: {
            idPaciente: data.idPaciente,
            idBolsista: data.idBolsista,
          },
        });

        await tx.listaEspera.deleteMany({
          where: { idPaciente: data.idPaciente },
        });

        return novoRegistro;
      });

      if (reqUser) {
        const { AuditService } = await import("./audit.service.js");
        const audit = new AuditService();
        await audit.log({
          idBolsista: reqUser.id,
          role: reqUser.role as any,
          acao: "CRIAR_LISTA_REGULAR",
          entidade: "ListaRegular",
          entidadeId: resultado.idListaRegular,
          pacienteId: data.idPaciente,
          ...(reqUser.ip ? { ip_origem: reqUser.ip } : {}),
        });
      }

      return resultado;
    } catch (error: any) {
      if (error.code === "P2025") {
        console.error(
          "Erro ao criar na lista regular: Colaborador não encontrado.",
          error
        );
        throw new Error("Colaborador informado não existe.");
      }
      if (
        error instanceof Error &&
        error.message === "Paciente não encontrado na lista de espera."
      ) {
        console.error("Erro ao criar na lista regular:", error.message);
        throw error;
      }

      console.error(
        "Erro ao mover paciente da lista de espera para a regular:",
        error
      );
      throw new Error("Erro interno ao adicionar paciente na lista regular.");
    }
  }

  async findAll(usuario: UsuarioLogado) {
    try {
      const queryOptions = {
        include: {
          paciente: true,
          colaborador: true,
        },
        orderBy: {
          idListaRegular: "asc",
        } as any,
        where: {},
      };

      if (usuario.role === "BOLSISTA") {
        queryOptions.where = {
          idBolsista: usuario.id,
        };
      }

      const listaRegular = await prisma.listaRegular.findMany(queryOptions);

      return listaRegular;
    } catch (error) {
      console.error("Erro ao buscar lista regular:", error);
      throw new Error("Não foi possível buscar a lista regular.");
    }
  }

  async findOne(id: number) {
    try {
      const entradaListaRegular = await prisma.listaRegular.findUniqueOrThrow({
        where: { idListaRegular: id },
        include: {
          paciente: true,
          colaborador: true,
        },
      });
      return entradaListaRegular;
    } catch (error: any) {
      if (error.code === "P2025") {
        console.error(`Entrada da lista regular com ID ${id} não encontrada.`);
        throw new Error("Entrada da lista regular não encontrada.");
      }
      console.error(
        `Erro ao buscar entrada da lista regular com ID ${id}:`,
        error
      );
      throw new Error("Erro ao buscar a entrada da lista regular.");
    }
  }

  async delete(id: number, reqUser?: { id: number; role: string; ip?: string }) {
    try {
      const listaRegularParaArquivar =
        await prisma.listaRegular.findUniqueOrThrow({
          where: { idListaRegular: id },
        });

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.listaRegular.delete({
          where: { idListaRegular: id },
        });

        await tx.historico.create({
          data: {
            idPaciente: listaRegularParaArquivar.idPaciente,
            id_ultimo_bolsista: listaRegularParaArquivar.idBolsista,
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
          acao: "ARQUIVAR_LISTA_REGULAR",
          entidade: "ListaRegular",
          entidadeId: id,
          pacienteId: listaRegularParaArquivar.idPaciente,
          ...(reqUser.ip ? { ip_origem: reqUser.ip } : {}),
        });
      }
    } catch (error: any) {
      if (error.code === "P2025" || error.message.includes("não encontrado")) {
        throw new Error("Registro na lista regular não encontrado.");
      }
      console.error(
        `Erro ao arquivar registro da lista regular com ID ${id}:`,
        error
      );
      throw new Error("Não foi possível arquivar o registro.");
    }
  }
}
