/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return String(date);
  }
};

const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return String(date);
  }
};

const STATUS_LABEL: Record<string, string> = {
  REALIZADA: "Realizada",
  FALTA_JUSTIFICADA: "Falta Justificada",
  FALTA_NAO_JUSTIFICADA: "Falta Nao Justificada",
  CANCELADA: "Cancelada",
};

const MODALIDADE_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  ONLINE: "Online",
  TELEFONE: "Telefone",
  OUTRO: "Outro",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  BOLSISTA: "Bolsista/Psicologo(a)",
};

// ─── Layout Constants ───────────────────────────────────────────────────────

const M = 15; // margin
const PW = 210; // page width
const CW = PW - M * 2; // content width
const PAGE_HEIGHT = 297;
const FOOTER_HEIGHT = 22;
const MAX_Y = PAGE_HEIGHT - FOOTER_HEIGHT; // 275

const C = {
  primary: [30, 64, 120] as [number, number, number],
  secondary: [71, 85, 105] as [number, number, number],
  accent: [248, 250, 252] as [number, number, number],
  border: [203, 213, 225] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  warning: [180, 110, 0] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [30, 30, 30] as [number, number, number],
};

// ─── Função Principal ──────────────────────────────────────────────────────

export const generateProntuarioPdf = (prontuario: any): void => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const emissao = formatDateTime(new Date());

  let y = M;

  // ─── Helpers de Paginação e Desenho ───

  /**
   * Garante que existe espaço suficiente na página. Se não houver,
   * cria uma nova página e reseta o cursor Y. Permite injetar um callback
   * para desenhar cabeçalhos de continuação.
   */
  const ensureSpace = (needed: number, onPageBreak?: () => void) => {
    if (y + needed > MAX_Y) {
      doc.addPage();
      y = M + 5;
      if (onPageBreak) onPageBreak();
    }
  };

  /**
   * Escreve texto com quebra de linha automática.
   * Se o texto for longo e passar de página, quebra a página corretamente.
   */
  const drawWrappedText = (
    text: string,
    x: number,
    maxW: number,
    lh: number,
    onPageBreak?: () => void
  ) => {
    const lines = doc.splitTextToSize(text || "", maxW);
    for (let i = 0; i < lines.length; i++) {
      ensureSpace(lh + 2, onPageBreak);
      doc.text(lines[i], x, y);
      y += lh;
    }
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.primary);
    doc.text(title, M, y);
    y += 3;
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(0.5);
    doc.line(M, y, PW - M, y);
    y += 8;
  };

  const drawInfoBox = (rows: [string, string, string, string][]) => {
    const col1W = 42;
    const col2W = CW / 2 - col1W;
    const col3W = 42;
    const col4W = CW / 2 - col3W;
    const rowH = 7.5;

    rows.forEach((row, i) => {
      ensureSpace(rowH + 2);
      const bg = i % 2 === 0 ? C.accent : C.white;
      doc.setFillColor(...bg);
      doc.rect(M, y, CW, rowH, "F");

      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.1);
      doc.rect(M, y, CW, rowH, "S");

      const textY = y + 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.secondary);
      doc.text(row[0], M + 2, textY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.black);
      const v1 = doc.splitTextToSize(row[1] || "-", col2W - 4);
      doc.text(v1[0] || "-", M + col1W, textY);

      if (row[2]) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.secondary);
        doc.text(row[2], M + col1W + col2W + 2, textY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.black);
        const v2 = doc.splitTextToSize(row[3] || "-", col4W - 4);
        doc.text(v2[0] || "-", M + col1W + col2W + col3W, textY);
      }

      y += rowH;
    });
    y += 8;
  };

  const drawTimeline = (timelineEvents: any[]) => {
    const colEvW = 60; const colDtW = 30; const colDeW = CW - colEvW - colDtW;
    const thH = 8;

    ensureSpace(thH + 10);
    doc.setFillColor(...C.primary);
    doc.rect(M, y, CW, thH, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text("Evento", M + 2, y + 5.5);
    doc.text("Data", M + colEvW + 2, y + 5.5);
    doc.text("Detalhes", M + colEvW + colDtW + 2, y + 5.5);
    y += thH;

    if (timelineEvents.length === 0) {
      ensureSpace(10);
      doc.setFillColor(...C.accent);
      doc.rect(M, y, CW, 8, "F");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.muted);
      doc.text("Nenhum evento registrado.", M + 2, y + 5.5);
      y += 12;
    } else {
      timelineEvents.forEach((ev, i) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        const evLines = doc.splitTextToSize(ev.evento, colEvW - 4);
        const deLines = doc.splitTextToSize(ev.detalhe, colDeW - 4);
        const maxLines = Math.max(evLines.length, deLines.length, 1);
        const rowH = Math.max(8, maxLines * 4.5 + 3.5);

        ensureSpace(rowH + 2);

        const bg = i % 2 === 0 ? C.accent : C.white;
        doc.setFillColor(...bg);
        doc.rect(M, y, CW, rowH, "F");
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.1);
        doc.rect(M, y, CW, rowH, "S");

        doc.setTextColor(...C.black);
        doc.text(evLines, M + 2, y + 5);
        doc.text(ev.data, M + colEvW + 2, y + 5);
        doc.text(deLines, M + colEvW + colDtW + 2, y + 5);

        y += rowH;
      });
      y += 10;
    }
  };

  const drawSessionBlock = (sessao: any, idx: number) => {
    // Espaço aproximado do cabeçalho da sessão
    ensureSpace(40);

    // Cabeçalho / Título
    doc.setFillColor(...C.accent);
    doc.rect(M, y, CW, 9, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.rect(M, y, CW, 9, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.primary);
    const sesLabel = STATUS_LABEL[sessao.status] ?? sessao.status;
    doc.text(`SESSAO #${idx} - ${sesLabel.toUpperCase()}`, M + 3, y + 6);
    y += 14;

    // Metadados
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.secondary);
    doc.text(`Data:`, M + 3, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.black);
    doc.text(formatDate(sessao.dataSessao), M + 13, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.secondary);
    doc.text(`Modalidade:`, M + 45, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.black);
    doc.text(MODALIDADE_LABEL[sessao.modalidade] ?? sessao.modalidade, M + 66, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.secondary);
    doc.text(`Responsavel:`, M + 3, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.black);
    const prof = sessao.colaborador?.nome ?? "-";
    const role = ROLE_LABEL[sessao.colaborador?.role] ?? "-";
    doc.text(`${prof} (${role})`, M + 26, y);
    y += 8;

    // Observação Administrativa
    if (sessao.observacao) {
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.2);
      doc.line(M, y - 3, PW - M, y - 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.warning);
      doc.text("Observacao Administrativa:", M + 3, y + 1);
      y += 6;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.black);
      drawWrappedText(sessao.observacao, M + 3, CW - 6, 4.5);
      y += 5;
    }

    // Linha divisória antes do relatório
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(M, y - 2, PW - M, y - 2);
    y += 5;

    // Texto do Relatório
    if (sessao.relatorio?.texto) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.success);
      doc.text("Relatorio Evolutivo:", M + 3, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.black);

      const onPageBreak = () => {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        doc.text(`(Continuacao da Sessao #${idx})`, M, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...C.black);
      };

      drawWrappedText(sessao.relatorio.texto, M + 3, CW - 6, 5, onPageBreak);
      y += 5;
    } else if (sessao.status !== "REALIZADA") {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.muted);
      doc.text("Sem relatorio clinico registrado para esta sessao.", M + 3, y);
      y += 5;
    }

    // Espaçamento final
    y += 8;
  };

  const drawAnotacaoBlock = (rel: any, idx: number) => {
    ensureSpace(35);

    doc.setFillColor(239, 246, 255);
    doc.rect(M, y, CW, 9, "F");
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.3);
    doc.rect(M, y, CW, 9, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.primary);
    doc.text(`ANOTACAO ADMINISTRATIVA #${idx}`, M + 3, y + 6);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.secondary);
    doc.text(`Data/Hora:`, M + 3, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.black);
    doc.text(formatDateTime(rel.data_criacao), M + 22, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.secondary);
    doc.text(`Elaborado por:`, M + 3, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.black);
    doc.text(`${rel.colaborador?.nome ?? "-"} (${ROLE_LABEL[rel.colaborador?.role] ?? "-"})`, M + 28, y);
    y += 8;

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(M, y - 2, PW - M, y - 2);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.black);

    const onPageBreak = () => {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(`(Continuacao da Anotacao Administrativa #${idx})`, M, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.black);
    };

    drawWrappedText(rel.texto || "", M + 3, CW - 6, 5, onPageBreak);
    y += 12;
  };

  // ─── CABEÇALHO DA PRIMEIRA PÁGINA ──────────────────────────────────────────
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PW, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.white);
  doc.text("APSIA", M, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Sistema de Gestao e Acompanhamento Psicologico Integrado Academico", M, 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Programa de Acompanhamento Psicológico Estudantil (PAPSE)", M, 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PRONTUARIO DO PACIENTE", PW - M, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Emitido em: " + emissao, PW - M, 21, { align: "right" });

  doc.setDrawColor(...C.white);
  doc.setLineWidth(0.3);
  doc.line(M, 34, PW - M, 34);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 255);
  doc.text("Documento de uso interno - Informacao protegida por sigilo profissional, LGPD e CFP", M, 39);

  y = 52;

  // ─── SEÇÃO 1: DADOS DO PACIENTE ─────────────────────────────────────────
  const { paciente, situacaoAtual, bolsistaAtual } = prontuario;

  drawSectionTitle("1. DADOS DO PACIENTE");

  drawInfoBox([
    ["Nome Completo", paciente?.nome || "-", "Matricula", paciente?.matricula || "-"],
    ["Curso", paciente?.curso || "-", "Telefone", paciente?.telefone || "-"],
    ["E-mail", paciente?.email || "-", "Data de Nascimento", formatDate(paciente?.data_nascimento)],
    ["Data de Inscricao", formatDate(paciente?.data_inscricao), "Situacao Atual", situacaoAtual || "-"],
    ["Responsavel Atual", bolsistaAtual || "-", "", ""],
  ]);

  // ─── SEÇÃO 2: RESUMO ────────────────────────────────────────────────────
  drawSectionTitle("2. RESUMO DO ACOMPANHAMENTO");

  const { resumo } = prontuario;

  drawInfoBox([
    ["Primeiro Atendimento", formatDate(resumo?.primeiraSessao), "Ultima Sessao", formatDate(resumo?.ultimaSessao)],
    ["Sessoes Realizadas", String(resumo?.totalSessoesRealizadas ?? 0), "Total de Relatorios", String(resumo?.totalRelatorios ?? 0)],
    ["Faltas Justificadas", String(resumo?.totalFaltasJustificadas ?? 0), "Faltas Nao Justificadas", String(resumo?.totalFaltasNaoJustificadas ?? 0)],
    ["Cancelamentos", String(resumo?.totalCancelamentos ?? 0), "Total de Faltas", String(resumo?.totalFaltas ?? 0)],
  ]);

  // ─── SEÇÃO 3: LINHA DO TEMPO ─────────────────────────────────────────────
  drawSectionTitle("3. LINHA DO TEMPO DO ACOMPANHAMENTO");

  const { linhaDoTempo } = prontuario;

  const timelineEvents: { evento: string; data: string; detalhe: string }[] = [];

  if (linhaDoTempo?.dataInscricao)
    timelineEvents.push({ evento: "Inscricao no Sistema", data: formatDate(linhaDoTempo.dataInscricao), detalhe: "Paciente cadastrado" });
  if (linhaDoTempo?.entradaListaEspera)
    timelineEvents.push({ evento: "Lista de Espera", data: formatDate(linhaDoTempo.entradaListaEspera), detalhe: "Aguardando vaga" });
  if (linhaDoTempo?.entradaProtocolo)
    timelineEvents.push({ evento: "Inicio - Protocolo", data: formatDate(linhaDoTempo.entradaProtocolo), detalhe: "Inicio do atendimento em protocolo" });
  if (linhaDoTempo?.entradaRegular)
    timelineEvents.push({ evento: "Inicio - Regular", data: formatDate(linhaDoTempo.entradaRegular), detalhe: "Inicio do atendimento regular" });

  (prontuario.sessoes || []).forEach((s: any, idx: number) => {
    const label = STATUS_LABEL[s.status] ?? s.status;
    timelineEvents.push({
      evento: `Sessao #${idx + 1} - ${label}`,
      data: formatDate(s.dataSessao),
      detalhe: `${MODALIDADE_LABEL[s.modalidade] ?? s.modalidade} | Resp.: ${s.colaborador?.nome ?? "-"}`,
    });
  });

  if (linhaDoTempo?.dataDesligamento)
    timelineEvents.push({ evento: "Encerramento", data: formatDate(linhaDoTempo.dataDesligamento), detalhe: "Desligamento do acompanhamento" });

  drawTimeline(timelineEvents);

  // ─── SEÇÃO 4: HISTÓRICO CLÍNICO ──────────────────────────────────────────
  doc.addPage();
  y = M + 5;

  drawSectionTitle("4. HISTORICO CLINICO COMPLETO");

  const sessoes = prontuario.sessoes || [];

  if (sessoes.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text("Nenhuma sessao registrada para este paciente.", M, y);
    y += 10;
  } else {
    sessoes.forEach((sessao: any, idx: number) => {
      drawSessionBlock(sessao, idx + 1);
    });
  }

  // ─── SEÇÃO 5: ANOTAÇÕES ADMINISTRATIVAS ──────────────────────────────────
  const relatoriosAvulsos = prontuario.relatoriosAvulsos || [];

  if (relatoriosAvulsos.length > 0) {
    ensureSpace(30);
    drawSectionTitle("5. ANOTACOES ADMINISTRATIVAS");

    relatoriosAvulsos.forEach((rel: any, idx: number) => {
      drawAnotacaoBlock(rel, idx + 1);
    });
  }

  // ─── RODAPÉ EM TODAS AS PÁGINAS ──────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  const avisoConfidencialidade = "Documento confidencial • Contem dados pessoais e dados pessoais sensiveis protegidos pela Lei n 13.709/2018 (LGPD). O acesso, utilizacao, reproducao, armazenamento ou compartilhamento nao autorizado e proibido. Este documento deve ser tratado em conformidade com a legislacao vigente e com os principios eticos estabelecidos pelo Conselho Federal de Psicologia (CFP).";

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "normal");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(M, PAGE_HEIGHT - FOOTER_HEIGHT, PW - M, PAGE_HEIGHT - FOOTER_HEIGHT);
    doc.text(
      `Documento gerado automaticamente pelo APSIA | Emissao: ${emissao} | Pagina ${i} de ${totalPages}`,
      PW / 2, PAGE_HEIGHT - FOOTER_HEIGHT + 4,
      { align: "center", maxWidth: CW }
    );

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    const avisoLines = doc.splitTextToSize(avisoConfidencialidade, CW);
    doc.text(avisoLines, PW / 2, PAGE_HEIGHT - FOOTER_HEIGHT + 9, { align: "center" });
  }

  // ─── DOWNLOAD ────────────────────────────────────────────────────────────
  const nomePaciente = (paciente?.nome || "paciente").replace(/\s+/g, "_").toLowerCase();
  const dataHoje = new Date().toISOString().slice(0, 10);
  doc.save(`prontuario_${nomePaciente}_${dataHoje}.pdf`);
};
