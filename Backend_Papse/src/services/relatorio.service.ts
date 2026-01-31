import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createRelatorioService = async (
  idPaciente: number,
  idBolsista: number,
  texto: string,
) => {
  return await prisma.relatorioEvolutivo.create({
    data: {
      idPaciente,
      idBolsista,
      texto,
    },
  });
};

export const getRelatoriosByPacienteService = async (idPaciente: number) => {
  return await prisma.relatorioEvolutivo.findMany({
    where: { idPaciente },
    include: {
      colaborador: {
        select: { nome: true, matricula: true },
      },
    },
    orderBy: {
      data_criacao: "desc",
    },
  });
};
