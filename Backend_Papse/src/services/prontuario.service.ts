import { prisma } from "../lib/prisma.js";

export const getProntuarioCompletoService = async (idPaciente: number) => {
  // Busca todos os dados do paciente em paralelo para máxima performance
  const [paciente, sessoes, relatoriosAvulsos, protocolo, regular, listaEspera, listaRegular, historico] =
    await Promise.all([
      // 1. Dados pessoais completos
      prisma.paciente.findUniqueOrThrow({
        where: { idPaciente },
        select: {
          idPaciente: true,
          nome: true,
          email: true,
          matricula: true,
          curso: true,
          telefone: true,
          data_nascimento: true,
          data_inscricao: true,
          ativo: true,
          relato: true, // campo necessário para exibição no prontuário e no PDF
        },
      }),

      // 2. Todas as sessões clínicas com relatório e colaborador
      prisma.sessao.findMany({
        where: { idPaciente },
        include: {
          colaborador: { select: { nome: true, matricula: true, role: true } },
          relatorio: { select: { idRelatorio: true, texto: true, data_criacao: true } },
        },
        orderBy: { dataSessao: "asc" },
      }),

      // 3. Relatórios avulsos (sem sessão vinculada — criados diretamente pelo Admin)
      prisma.relatorioEvolutivo.findMany({
        where: { idPaciente, idSessao: null },
        include: {
          colaborador: { select: { nome: true, matricula: true, role: true } },
        },
        orderBy: { data_criacao: "asc" },
      }),

      // 4. Situação atual nas listas
      prisma.protocolo.findFirst({
        where: { idPaciente },
        include: { colaborador: { select: { nome: true } } },
        orderBy: { idProtocolo: "desc" },
      }),

      prisma.regular.findFirst({
        where: { idPaciente },
        include: { colaborador: { select: { nome: true } } },
        orderBy: { idRegular: "desc" },
      }),

      prisma.listaEspera.findFirst({
        where: { idPaciente },
        orderBy: { idListaEspera: "desc" },
      }),

      prisma.listaRegular.findFirst({
        where: { idPaciente },
        include: { colaborador: { select: { nome: true } } },
        orderBy: { idListaRegular: "desc" },
      }),

      // 5. Histórico de desligamento (pode não existir)
      prisma.historico.findFirst({
        where: { idPaciente },
        include: { colaborador: { select: { nome: true } } },
        orderBy: { idHistorico: "desc" },
      }),
    ]);

  // Determinar situação atual legível
  let situacaoAtual = "Indefinida";
  let bolsistaAtual: string | null = null;

  if (historico && !protocolo && !regular && !listaEspera && !listaRegular) {
    situacaoAtual = "Desligado / Encerrado";
  } else if (protocolo) {
    situacaoAtual = "Atendimento – Protocolo";
    bolsistaAtual = protocolo.colaborador?.nome ?? null;
  } else if (regular) {
    situacaoAtual = "Atendimento – Regular";
    bolsistaAtual = regular.colaborador?.nome ?? null;
  } else if (listaRegular) {
    situacaoAtual = "Lista de Espera (Regular)";
    bolsistaAtual = listaRegular.colaborador?.nome ?? null;
  } else if (listaEspera) {
    situacaoAtual = "Lista de Espera";
  }

  // Calcular resumo estatístico
  const sessoesRealizadas = sessoes.filter((s) => s.status === "REALIZADA");
  const sessoesFaltaJustificada = sessoes.filter((s) => s.status === "FALTA_JUSTIFICADA");
  const sessoesFaltaNaoJustificada = sessoes.filter((s) => s.status === "FALTA_NAO_JUSTIFICADA");
  const sessoesCanceladas = sessoes.filter((s) => s.status === "CANCELADA");
  const totalFaltas = sessoesFaltaJustificada.length + sessoesFaltaNaoJustificada.length;

  const primeiraSessao = sessoes.length > 0 ? sessoes[0]?.dataSessao : null;
  const ultimaSessao = sessoes.length > 0 ? sessoes[sessoes.length - 1]?.dataSessao : null;
  const totalRelatorios = sessoesRealizadas.filter((s) => s.relatorio !== null).length + relatoriosAvulsos.length;

  return {
    paciente,
    situacaoAtual,
    bolsistaAtual,
    resumo: {
      primeiraSessao,
      ultimaSessao,
      totalSessoesRealizadas: sessoesRealizadas.length,
      totalFaltasJustificadas: sessoesFaltaJustificada.length,
      totalFaltasNaoJustificadas: sessoesFaltaNaoJustificada.length,
      totalCancelamentos: sessoesCanceladas.length,
      totalFaltas,
      totalRelatorios,
    },
    linhaDoTempo: {
      dataInscricao: paciente.data_inscricao,
      entradaListaEspera: listaEspera ? paciente.data_inscricao : null,
      entradaProtocolo: protocolo?.data_inicio_atendimento ?? null,
      entradaRegular: regular?.data_inicio_atendimento ?? null,
      dataDesligamento: historico?.data_desligamento ?? null,
    },
    sessoes,
    relatoriosAvulsos,
  };
};
