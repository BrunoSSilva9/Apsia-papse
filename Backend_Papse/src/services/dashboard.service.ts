import { prisma } from "../lib/prisma.js";
import { Role } from "@prisma/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DashboardPeriod = "mes" | "trimestre" | "semestre" | "ano" | "total";

export interface PacienteResumoDto {
  id: number;
  nome: string;
  tipo: "Protocolo" | "Regular";
}

export interface BolsistaPacientesDto {
  id: number;
  nome: string;
  pacientes: number;
  pacientesList: PacienteResumoDto[];
}

export interface DashboardMetricsDto {
  period: DashboardPeriod;
  pacientes: {
    total: number;
    listaEspera: number;
    protocolo: number;
    regular: number;
    historico: number;
    novosInscritos: number;
  };
  colaboradores: {
    total: number;
    bolsistas: number;
    administradores: number;
  };
  sessoes: {
    realizadas: number;
    canceladas: number;
    faltas: number;
    total: number;
  };
  relatorios: {
    total: number;
  };
  auditoria: {
    total: number;
  };
  bolsistasPorPacientes: BolsistaPacientesDto[];
}

// ─── Utilitário: calcula a data de início do período ─────────────────────────

function getPeriodStart(period: DashboardPeriod): Date | null {
  if (period === "total") return null;

  const now = new Date();

  switch (period) {
    case "mes":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "trimestre":
      return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    case "semestre":
      return new Date(now.getFullYear(), now.getMonth() - 5, 1);
    case "ano":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

// ─── Validação do parâmetro ───────────────────────────────────────────────────

const VALID_PERIODS: DashboardPeriod[] = ["mes", "trimestre", "semestre", "ano", "total"];

export function parsePeriod(raw: unknown): DashboardPeriod {
  if (typeof raw === "string" && VALID_PERIODS.includes(raw as DashboardPeriod)) {
    return raw as DashboardPeriod;
  }
  return "mes"; // padrão
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class DashboardService {
  async getMetrics(period: DashboardPeriod = "mes"): Promise<DashboardMetricsDto> {
    const periodStart = getPeriodStart(period);

    // Filtro de data reutilizável (undefined = sem filtro de período)
    const dateFilter = periodStart ? { gte: periodStart } : undefined;

    // Executa todas as queries em paralelo para performance máxima
    const [
      totalListaEspera,
      totalProtocolo,
      totalRegular,
      totalHistorico,
      novosInscritos,
      colaboradoresCount,
      sessoesGrouped,
      totalRelatorios,
      totalAuditoria,
      bolsistasComPacientes,
    ] = await Promise.all([

      // Lista de espera (estado atual — sem filtro de período)
      prisma.listaEspera.count(),

      // Protocolo (estado atual — sem filtro de período)
      prisma.protocolo.count(),

      // Regular (estado atual — sem filtro de período)
      prisma.regular.count(),

      // Histórico (estado atual — sem filtro de período)
      prisma.historico.count(),

      // Novos pacientes inscritos no período (filtrado)
      prisma.paciente.count({
        where: dateFilter
          ? { data_inscricao: dateFilter, ativo: true }
          : { ativo: true },
      }),

      // Colaboradores agrupados por role (estado atual — sem filtro)
      prisma.colaborador.groupBy({
        by: ["role"],
        _count: { idBolsista: true },
        where: { data_saida: null },
      }),

      // Sessões agrupadas por status — FILTRADAS por período
      prisma.sessao.groupBy({
        by: ["status"],
        _count: { idSessao: true },
        ...(dateFilter ? { where: { dataSessao: dateFilter } } : {}),
      }),

      // Total de relatórios evolutivos — FILTRADOS por período
      prisma.relatorioEvolutivo.count({
        where: dateFilter ? { data_criacao: dateFilter } : {},
      }),

      // Total de registros de auditoria (sem filtro — dado operacional global)
      prisma.logAuditoria.count(),

      // Pacientes por bolsista ativo — com lista de nomes para o accordion
      prisma.colaborador.findMany({
        where: {
          role: Role.BOLSISTA,
          data_saida: null,
        },
        select: {
          idBolsista: true,
          nome: true,
          Protocolo: {
            select: {
              paciente: {
                select: { idPaciente: true, nome: true },
              },
            },
          },
          Regular: {
            select: {
              paciente: {
                select: { idPaciente: true, nome: true },
              },
            },
          },
        },
      }),
    ]);

    // ─── Processar totais de atendimento ativo ───────────────────────────────
    const totalPacientesAtivos = totalProtocolo + totalRegular;

    // ─── Processar colaboradores ─────────────────────────────────────────────
    const bolsistasCount =
      colaboradoresCount.find((c) => c.role === Role.BOLSISTA)?._count.idBolsista ?? 0;
    const adminsCount =
      colaboradoresCount.find((c) => c.role === Role.ADMIN)?._count.idBolsista ?? 0;
    const totalColaboradores = bolsistasCount + adminsCount;

    // ─── Processar sessões ───────────────────────────────────────────────────
    const sessaoMap: Record<string, number> = {};
    sessoesGrouped.forEach((s) => {
      sessaoMap[s.status] = s._count.idSessao;
    });

    const sessoesRealizadas     = sessaoMap["REALIZADA"] ?? 0;
    const sessoesCanceladas     = sessaoMap["CANCELADA"] ?? 0;
    const faltasJustificadas    = sessaoMap["FALTA_JUSTIFICADA"] ?? 0;
    const faltasNaoJustificadas = sessaoMap["FALTA_NAO_JUSTIFICADA"] ?? 0;
    const totalFaltas           = faltasJustificadas + faltasNaoJustificadas;
    const totalSessoes          = sessoesRealizadas + sessoesCanceladas + totalFaltas;

    // ─── Processar bolsistas por pacientes ───────────────────────────────────
    const bolsistasPorPacientes: BolsistaPacientesDto[] = bolsistasComPacientes
      .map((b) => {
        const listProtocolo: PacienteResumoDto[] = b.Protocolo.map((p) => ({
          id: p.paciente.idPaciente,
          nome: p.paciente.nome,
          tipo: "Protocolo" as const,
        }));
        const listRegular: PacienteResumoDto[] = b.Regular.map((p) => ({
          id: p.paciente.idPaciente,
          nome: p.paciente.nome,
          tipo: "Regular" as const,
        }));
        const pacientesList = [...listProtocolo, ...listRegular].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR")
        );
        return {
          id: b.idBolsista,
          nome: b.nome,
          pacientes: pacientesList.length,
          pacientesList,
        };
      })
      .sort((a, b) => {
        if (b.pacientes !== a.pacientes) return b.pacientes - a.pacientes;
        return a.nome.localeCompare(b.nome, "pt-BR");
      });

    return {
      period,
      pacientes: {
        total: totalPacientesAtivos,
        listaEspera: totalListaEspera,
        protocolo: totalProtocolo,
        regular: totalRegular,
        historico: totalHistorico,
        novosInscritos,
      },
      colaboradores: {
        total: totalColaboradores,
        bolsistas: bolsistasCount,
        administradores: adminsCount,
      },
      sessoes: {
        realizadas: sessoesRealizadas,
        canceladas: sessoesCanceladas,
        faltas: totalFaltas,
        total: totalSessoes,
      },
      relatorios: {
        total: totalRelatorios,
      },
      auditoria: {
        total: totalAuditoria,
      },
      bolsistasPorPacientes,
    };
  }
}
