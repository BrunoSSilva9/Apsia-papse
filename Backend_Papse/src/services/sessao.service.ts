import { prisma } from "../lib/prisma.js";
import { StatusSessao, ModalidadeSessao } from "@prisma/client";

export interface CreateSessaoDto {
  idPaciente: number;
  idBolsista: number;
  dataSessao: string;
  status: StatusSessao;
  modalidade: ModalidadeSessao;
  duracao?: number;
  observacao?: string;
  texto?: string;
}

export const createSessaoService = async (dto: CreateSessaoDto) => {
  const { idPaciente, idBolsista, dataSessao, status, modalidade, duracao, observacao, texto } = dto;

  const sessao = await prisma.sessao.create({
    data: {
      dataSessao: new Date(dataSessao),
      status,
      modalidade,
      duracao: duracao ?? null,
      observacao: observacao ?? null,
      idPaciente,
      idBolsista,
      ...(status === StatusSessao.REALIZADA && texto
        ? {
            relatorio: {
              create: {
                texto,
                idPaciente,
                idBolsista,
              },
            },
          }
        : {}),
    },
    include: {
      relatorio: true,
      paciente: { select: { nome: true } },
      colaborador: { select: { nome: true } },
    },
  });

  if (status === StatusSessao.REALIZADA) {
    await _incrementarQtdeSessoes(idPaciente);
  }

  return sessao;
};

export const getSessoesByPacienteService = async (idPaciente: number) => {
  return await prisma.sessao.findMany({
    where: { idPaciente },
    include: {
      relatorio: true,
      colaborador: { select: { nome: true, matricula: true } },
    },
    orderBy: { dataSessao: "desc" },
  });
};

async function _incrementarQtdeSessoes(idPaciente: number): Promise<void> {
  const protocolo = await prisma.protocolo.findFirst({
    where: { idPaciente },
    orderBy: { idProtocolo: "desc" },
  });
  if (protocolo) {
    await prisma.protocolo.update({
      where: { idProtocolo: protocolo.idProtocolo },
      data: { qtde_sessoes: { increment: 1 } },
    });
    return;
  }

  const regular = await prisma.regular.findFirst({
    where: { idPaciente },
    orderBy: { idRegular: "desc" },
  });
  if (regular) {
    await prisma.regular.update({
      where: { idRegular: regular.idRegular },
      data: { qtde_sessoes: { increment: 1 } },
    });
  }
}
