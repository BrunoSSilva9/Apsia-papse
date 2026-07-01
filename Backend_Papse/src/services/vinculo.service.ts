import { prisma } from "../lib/prisma.js";

export const verificarVinculoService = async (idPaciente: number, idBolsista: number) => {
  const isProtocolo = await prisma.protocolo.findFirst({ where: { idPaciente, idBolsista } });
  if (isProtocolo) return true;
  
  const isRegular = await prisma.regular.findFirst({ where: { idPaciente, idBolsista } });
  if (isRegular) return true;
  
  const isListaRegular = await prisma.listaRegular.findFirst({ where: { idPaciente, idBolsista } });
  if (isListaRegular) return true;

  return false;
};
