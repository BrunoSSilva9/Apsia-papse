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

export const verificarVinculoService = async (idPaciente: number, idBolsista: number) => {
  const isProtocolo = await prisma.protocolo.findFirst({ where: { idPaciente, idBolsista } });
  if (isProtocolo) return true;
  
  const isRegular = await prisma.regular.findFirst({ where: { idPaciente, idBolsista } });
  if (isRegular) return true;
  
  const isListaRegular = await prisma.listaRegular.findFirst({ where: { idPaciente, idBolsista } });
  if (isListaRegular) return true;

  return false;
};
