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

// ─── Layout ────────────────────────────────────────────────────────────────

const M = 15; // margin
const PW = 210; // page width
const CW = PW - M * 2; // content width
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

// ─── Helpers de desenho ────────────────────────────────────────────────────



const drawSectionTitle = (doc: jsPDF, title: string, y: number): number => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text(title, M, y);
  y += 2;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.line(M, y, PW - M, y);
  return y + 6;
};

const drawInfoBox = (
  doc: jsPDF,
  rows: [string, string, string, string][],
  y: number
): number => {
  const col1W = 42;
  const col2W = CW / 2 - col1W;
  const col3W = 42;
  const col4W = CW / 2 - col3W;
  const rowH = 7;

  rows.forEach((row, i) => {
    const bg = i % 2 === 0 ? C.accent : C.white;
    doc.setFillColor(...bg);
    doc.rect(M, y, CW, rowH, "F");

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.1);
    doc.rect(M, y, CW, rowH, "S");

    const textY = y + 4.8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
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

  return y + 4;
};

// ─── Função Principal ──────────────────────────────────────────────────────

export const generateProntuarioPdf = (prontuario: any): void => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const emissao = formatDateTime(new Date());
  let y = M;

  const ensureSpace = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = M + 5;
    }
  };

  const wrappedText = (
    text: string,
    x: number,
    startY: number,
    maxW: number,
    lh = 4.5
  ): number => {
    const lines = doc.splitTextToSize(text || "", maxW);
    lines.forEach((line: string) => {
      ensureSpace(lh + 2);
      doc.text(line, x, startY);
      startY += lh;
    });
    return startY;
  };

  // ─── CABEÇALHO ─────────────────────────────────────────────────────────────
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PW, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.white);
  doc.text("APSIA", M, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Sistema de Gestao e Acompanhamento Psicologico Integrado Academico", M, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Programa PAPSE", M, 27);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PRONTUARIO DO PACIENTE", PW - M, 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Emitido em: " + emissao, PW - M, 20, { align: "right" });

  doc.setDrawColor(...C.white);
  doc.setLineWidth(0.3);
  doc.line(M, 33, PW - M, 33);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 255);
  doc.text("Documento de uso interno - Informacao protegida por sigilo profissional e LGPD", M, 38);

  y = 52;

  // ─── SEÇÃO 1: DADOS DO PACIENTE ─────────────────────────────────────────
  const { paciente, situacaoAtual, bolsistaAtual } = prontuario;

  y = drawSectionTitle(doc, "1. DADOS DO PACIENTE", y);

  y = drawInfoBox(doc, [
    ["Nome Completo", paciente?.nome || "-", "Matricula", paciente?.matricula || "-"],
    ["Curso", paciente?.curso || "-", "Telefone", paciente?.telefone || "-"],
    ["E-mail", paciente?.email || "-", "Data de Nascimento", formatDate(paciente?.data_nascimento)],
    ["Data de Inscricao", formatDate(paciente?.data_inscricao), "Situacao Atual", situacaoAtual || "-"],
    ["Responsavel Atual", bolsistaAtual || "-", "", ""],
  ], y);

  // ─── SEÇÃO 2: RESUMO ────────────────────────────────────────────────────
  ensureSpace(55);
  y = drawSectionTitle(doc, "2. RESUMO DO ACOMPANHAMENTO", y);

  const { resumo } = prontuario;

  y = drawInfoBox(doc, [
    ["Primeiro Atendimento", formatDate(resumo?.primeiraSessao), "Ultima Sessao", formatDate(resumo?.ultimaSessao)],
    ["Sessoes Realizadas", String(resumo?.totalSessoesRealizadas ?? 0), "Total de Relatorios", String(resumo?.totalRelatorios ?? 0)],
    ["Faltas Justificadas", String(resumo?.totalFaltasJustificadas ?? 0), "Faltas Nao Justificadas", String(resumo?.totalFaltasNaoJustificadas ?? 0)],
    ["Cancelamentos", String(resumo?.totalCancelamentos ?? 0), "Total de Faltas", String(resumo?.totalFaltas ?? 0)],
  ], y);

  // ─── SEÇÃO 3: LINHA DO TEMPO ─────────────────────────────────────────────
  ensureSpace(45);
  y = drawSectionTitle(doc, "3. LINHA DO TEMPO DO ACOMPANHAMENTO", y);

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

  // Cabeçalho da tabela de linha do tempo
  const colEvW = 60; const colDtW = 30; const colDeW = CW - colEvW - colDtW;
  const thH = 7;

  doc.setFillColor(...C.primary);
  doc.rect(M, y, CW, thH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text("Evento", M + 2, y + 5);
  doc.text("Data", M + colEvW + 2, y + 5);
  doc.text("Detalhes", M + colEvW + colDtW + 2, y + 5);
  y += thH;

  if (timelineEvents.length === 0) {
    doc.setFillColor(...C.accent);
    doc.rect(M, y, CW, 7, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text("Nenhum evento registrado.", M + 2, y + 5);
    y += 11;
  } else {
    timelineEvents.forEach((ev, i) => {
      ensureSpace(8);
      const bg = i % 2 === 0 ? C.accent : C.white;
      doc.setFillColor(...bg);
      doc.rect(M, y, CW, 7, "F");
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.1);
      doc.rect(M, y, CW, 7, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.black);

      const evLines = doc.splitTextToSize(ev.evento, colEvW - 4);
      doc.text(evLines[0] || "", M + 2, y + 4.8);
      doc.text(ev.data, M + colEvW + 2, y + 4.8);
      const deLines = doc.splitTextToSize(ev.detalhe, colDeW - 4);
      doc.text(deLines[0] || "", M + colEvW + colDtW + 2, y + 4.8);

      y += 7;
    });
    y += 4;
  }

  // ─── SEÇÃO 4: HISTÓRICO CLÍNICO ──────────────────────────────────────────
  doc.addPage();
  y = M;

  y = drawSectionTitle(doc, "4. HISTORICO CLINICO COMPLETO", y);

  const sessoes = prontuario.sessoes || [];

  if (sessoes.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text("Nenhuma sessao registrada para este paciente.", M, y);
    y += 10;
  }

  sessoes.forEach((sessao: any, idx: number) => {
    ensureSpace(30);

    // Faixa da sessão
    doc.setFillColor(...C.accent);
    doc.rect(M, y - 5, CW, 9, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.rect(M, y - 5, CW, 9, "S");

    const sesLabel = STATUS_LABEL[sessao.status] ?? sessao.status;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.primary);
    doc.text(
      `Sessao #${idx + 1}  -  ${formatDate(sessao.dataSessao)}  |  ${sesLabel}`,
      M + 3, y
    );
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.secondary);
    doc.text(
      `Modalidade: ${MODALIDADE_LABEL[sessao.modalidade] ?? sessao.modalidade}   |   Responsavel: ${sessao.colaborador?.nome ?? "-"}   |   Cargo: ${ROLE_LABEL[sessao.colaborador?.role] ?? "-"}`,
      M + 3, y
    );
    y += 5;

    if (sessao.observacao) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...C.warning);
      y = wrappedText(`Observacao: ${sessao.observacao}`, M + 3, y, CW - 6);
      y += 2;
    }

    if (sessao.relatorio?.texto) {
      ensureSpace(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.success);
      doc.text("Relatorio Evolutivo:", M + 3, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.black);
      y = wrappedText(sessao.relatorio.texto, M + 5, y, CW - 8);
    } else if (sessao.status !== "REALIZADA") {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text("Sem relatorio clinico registrado.", M + 5, y);
      y += 4.5;
    }

    y += 6;
  });

  // ─── SEÇÃO 5: ANOTAÇÕES ADMINISTRATIVAS ──────────────────────────────────
  const relatoriosAvulsos = prontuario.relatoriosAvulsos || [];

  if (relatoriosAvulsos.length > 0) {
    ensureSpace(20);
    y = drawSectionTitle(doc, "5. ANOTACOES ADMINISTRATIVAS", y);

    relatoriosAvulsos.forEach((rel: any) => {
      ensureSpace(25);

      doc.setFillColor(239, 246, 255);
      doc.rect(M, y - 5, CW, 9, "F");
      doc.setDrawColor(191, 219, 254);
      doc.setLineWidth(0.2);
      doc.rect(M, y - 5, CW, 9, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.primary);
      doc.text(`Anotacao Administrativa - ${formatDateTime(rel.data_criacao)}`, M + 3, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.secondary);
      doc.text(
        `Elaborado por: ${rel.colaborador?.nome ?? "-"} (${ROLE_LABEL[rel.colaborador?.role] ?? "-"})`,
        M + 3, y
      );
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.black);
      y = wrappedText(rel.texto || "", M + 5, y, CW - 8);
      y += 5;
    });
  }

  // ─── RODAPÉ EM TODAS AS PÁGINAS ──────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "normal");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(M, 285, PW - M, 285);
    doc.text(
      `Documento gerado automaticamente pelo APSIA | Emissao: ${emissao} | Pagina ${i} de ${totalPages}`,
      PW / 2, 289,
      { align: "center", maxWidth: CW }
    );
  }

  // ─── DOWNLOAD ────────────────────────────────────────────────────────────
  const nomePaciente = (paciente?.nome || "paciente").replace(/\s+/g, "_").toLowerCase();
  const dataHoje = new Date().toISOString().slice(0, 10);
  doc.save(`prontuario_${nomePaciente}_${dataHoje}.pdf`);
};
