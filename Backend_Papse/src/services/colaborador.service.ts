import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";

export interface CreateColaboradorDto {
  nome: string;
  matricula: string;
  email: string;
  data_admissao: Date;
  data_saida?: Date | null;
  senha: string;
  role: Role;
}

export type UpdateColaboradorDto = Partial<CreateColaboradorDto>;

export class ColaboradorService {
  async create(data: CreateColaboradorDto) {
    try {
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(data.senha, salt);

      const colaborador = await prisma.colaborador.create({
        data: {
          ...data,
          data_admissao: new Date(data.data_admissao),
          data_saida: data.data_saida ? new Date(data.data_saida) : null,
          role: data.role,
          senha: senhaHash,
        },
      });
      const { senha, ...colaboradorSemSenha } = colaborador;
      return colaboradorSemSenha;
    } catch (error: any) {
      if (error.code === "P2002") {
        if (error.meta?.target?.includes("matricula")) {
          throw new Error("Esta matrícula já está cadastrada.");
        }
        if (error.meta?.target?.includes("email")) {
          throw new Error("Este e-mail já está cadastrado.");
        }
      }
      console.error("Erro ao criar colaborador:", error);
      throw new Error("Não foi possível criar o colaborador.");
    }
  }

  async findAll() {
    try {
      const colaboradores = await prisma.colaborador.findMany();
      return colaboradores;
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
      throw new Error("Não foi possível buscar os colaboradores.");
    }
  }

  async findOne(id: number) {
    try {
      const colaborador = await prisma.colaborador.findUniqueOrThrow({
        where: { idBolsista: id },
      });
      return colaborador;
    } catch (error) {
      console.error(`Erro ao buscar colaborador com ID ${id}:`, error);
      throw new Error("Colaborador não encontrado.");
    }
  }

  async update(id: number, data: UpdateColaboradorDto) {
    try {
      const colaborador = await prisma.colaborador.update({
        where: { idBolsista: id },
        data: {
          ...data,
          ...(data.data_admissao && {
            data_admissao: new Date(data.data_admissao),
          }),
          ...(data.data_saida && { data_saida: new Date(data.data_saida) }),
        },
      });
      return colaborador;
    } catch (error: any) {
      if (error.code === "P2002") {
        if (error.meta?.target?.includes("matricula")) {
          throw new Error(
            "Esta matrícula já está sendo utilizada por outro colaborador.",
          );
        }
        if (error.meta?.target?.includes("email")) {
          throw new Error(
            "Este e-mail já está sendo utilizado por outro colaborador.",
          );
        }
      }
      console.error(`Erro ao atualizar colaborador com ID ${id}:`, error);
      throw new Error("Colaborador não encontrado ou dados inválidos.");
    }
  }

  async delete(id: number) {
    try {
      const emProtocolo = await prisma.protocolo.count({
        where: { idBolsista: id },
      });
      const emRegular = await prisma.regular.count({
        where: { idBolsista: id },
      });
      const emListaRegular = await prisma.listaRegular.count({
        where: { idBolsista: id },
      });

      if (emProtocolo > 0 || emRegular > 0 || emListaRegular > 0) {
        throw new Error("VINCULO_ATIVO");
      }


      await prisma.colaborador.update({
        where: { idBolsista: id },
        data: {
          data_saida: new Date(),
          senha: "INATIVO_" + Math.random().toString(), 
          resetToken: null,
          resetTokenExpires: null,
        },
      });
    } catch (error: any) {
      if (error.message === "VINCULO_ATIVO") {
        throw new Error(
          "Este bolsista ainda possui pacientes ativos. Transfira os pacientes antes de removê-lo.",
        );
      }
      console.error(`Erro ao inativar colaborador com ID ${id}:`, error);
      throw new Error("Erro interno ao inativar o colaborador.");
    }
  }
}
