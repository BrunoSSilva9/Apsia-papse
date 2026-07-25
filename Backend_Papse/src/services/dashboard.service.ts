import { prisma } from "../lib/prisma.js";
import { Role } from "@prisma/client";

export interface BolsistaPacientesDto {
  id: number;
  nome: string;
  pacientes: number;
}

export interface DashboardMetricsDto {
  pacientes: {
    total: number;
    listaEspera: number;
    protocolo: number;
    regular: number;
    historico: number;
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

export class DashboardService {
  async getMetrics(): Promise<DashboardMetricsDto> {
    // Executa todas as queries em paralelo para performance máxima
    const [
      totalPacientes,
      totalListaEspera,
      totalProtocolo,
      totalRegular,
      totalHistorico,
      colaboradoresCount,
      sessoesGrouped,
      totalRelatorios,
      totalAuditoria,
      bolsistasComPacientes,
    ] = await Promise.all([
      // Pacientes em atendimento ativo (Protocolo + Regular)
      // Lista de Espera e Histórico excluídos: não estão em atendimento
      prisma.protocolo.count().then(async (p) => p + await prisma.regular.count()),

      // Lista de espera
      prisma.listaEspera.count(),

      // Protocolo
      prisma.protocolo.count(),

      // Regular
      prisma.regular.count(),

      // Histórico (pacientes desligados)
      prisma.historico.count(),

      // Colaboradores agrupados por role
      prisma.colaborador.groupBy({
        by: ["role"],
        _count: { idBolsista: true },
      }),

      // Sessões agrupadas por status
      prisma.sessao.groupBy({
        by: ["status"],
        _count: { idSessao: true },
      }),

      // Total de relatórios evolutivos
      prisma.relatorioEvolutivo.count(),

      // Total de registros de auditoria
      prisma.logAuditoria.count(),

      // Pacientes por bolsista (Protocolo + Regular, sem duplicações)
      prisma.colaborador.findMany({
        where: {
          role: Role.BOLSISTA,
        },
        select: {
          idBolsista: true,
          nome: true,
          _count: {
            select: {
              Protocolo: true,
              Regular: true,
            },
          },
        },
      }),
    ]);

    // ─── Processar colaboradores ────────────────────────────────────────────
    const bolsistasCount =
      colaboradoresCount.find((c) => c.role === Role.BOLSISTA)?._count
        .idBolsista ?? 0;
    const adminsCount =
      colaboradoresCount.find((c) => c.role === Role.ADMIN)?._count
        .idBolsista ?? 0;
    const totalColaboradores = bolsistasCount + adminsCount;

    // ─── Processar sessões ──────────────────────────────────────────────────
    const sessaoMap: Record<string, number> = {};
    sessoesGrouped.forEach((s) => {
      sessaoMap[s.status] = s._count.idSessao;
    });

    const sessoesRealizadas = sessaoMap["REALIZADA"] ?? 0;
    const sessoesCanceladas = sessaoMap["CANCELADA"] ?? 0;
    const faltasJustificadas = sessaoMap["FALTA_JUSTIFICADA"] ?? 0;
    const faltasNaoJustificadas = sessaoMap["FALTA_NAO_JUSTIFICADA"] ?? 0;
    const totalFaltas = faltasJustificadas + faltasNaoJustificadas;
    const totalSessoes =
      sessoesRealizadas + sessoesCanceladas + totalFaltas;

    // ─── Processar bolsistas por pacientes ─────────────────────────────────
    // Conta Protocolo + Regular sem duplicação (são tabelas distintas,
    // um paciente não pode estar em ambas simultaneamente).
    const bolsistasPorPacientes: BolsistaPacientesDto[] = bolsistasComPacientes
      .map((b) => ({
        id: b.idBolsista,
        nome: b.nome,
        pacientes: (b._count.Protocolo ?? 0) + (b._count.Regular ?? 0),
      }))
      .sort((a, b) => {
        if (b.pacientes !== a.pacientes) return b.pacientes - a.pacientes;
        return a.nome.localeCompare(b.nome, "pt-BR");
      });

    return {
      pacientes: {
        total: totalPacientes,  // apenas Protocolo + Regular (em atendimento ativo)
        listaEspera: totalListaEspera,
        protocolo: totalProtocolo,
        regular: totalRegular,
        historico: totalHistorico,
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
