/**
 * auditCleanup.job.ts
 *
 * Job de limpeza automática dos Logs de Auditoria — Fase 1.
 *
 * Política de retenção: remove registros de LogAuditoria com data_hora
 * anterior ao limite definido em AUDIT_LOG_RETENTION_DAYS (padrão: 730 dias).
 *
 * Executa diariamente às 02:00 da manhã via node-cron.
 * Não registra auditoria de si mesmo, não altera nenhum outro dado do sistema.
 */

import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

// ─── Constantes e Configuração ────────────────────────────────────────────────

const LOG_PREFIX = "[AUDIT CLEANUP]";

/**
 * Lê AUDIT_LOG_RETENTION_DAYS do ambiente.
 * Garante que o valor seja um número positivo válido, ou usa o padrão de 730.
 */
function getRetentionDays(): number {
  const raw = process.env.AUDIT_LOG_RETENTION_DAYS;
  const parsed = Number(raw);
  if (!raw || isNaN(parsed) || parsed <= 0) {
    return 730; // padrão: 24 meses
  }
  return parsed;
}

/**
 * Calcula a data de corte: hoje menos o período de retenção em dias.
 */
function getCutoffDate(): Date {
  const days = getRetentionDays();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

// ─── Lógica Principal ─────────────────────────────────────────────────────────

async function runAuditCleanup(): Promise<void> {
  console.log(`\n${LOG_PREFIX} Executando limpeza automática...`);

  try {
    const cutoffDate = getCutoffDate();

    const result = await prisma.logAuditoria.deleteMany({
      where: {
        data_hora: {
          lt: cutoffDate,
        },
      },
    });

    if (result.count === 0) {
      console.log(`${LOG_PREFIX} Nenhum registro expirado encontrado.`);
    } else {
      console.log(`${LOG_PREFIX} ${result.count} registro(s) removido(s).`);
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Erro durante limpeza:`);
    console.error(error);
    // Não relança o erro: falha no cleanup jamais deve derrubar o servidor
  }
}

// ─── Agendamento ──────────────────────────────────────────────────────────────

/**
 * Inicializa o Job de limpeza de auditoria.
 * Expressão cron: "0 2 * * *" = todos os dias às 02:00.
 * Chamado uma vez na inicialização do servidor (server.ts).
 */
export function startAuditCleanupJob(): void {
  const retentionDays = getRetentionDays();

  cron.schedule("0 2 * * *", runAuditCleanup, {
    timezone: "America/Sao_Paulo",
  });

  console.log(
    `✅ [AUDIT CLEANUP] Job agendado — executa diariamente às 02:00 (America/Sao_Paulo). ` +
      `Retenção configurada: ${retentionDays} dia(s).`
  );
}
