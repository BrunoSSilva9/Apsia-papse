import React, { useEffect, useState } from "react";
import { getDashboardMetrics } from "../services/api";
import type { DashboardMetrics } from "../types";

// ─── Ícones SVG leves (sem dependência extra) ──────────────────────────────

const IconUsers = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-2 0" />
  </svg>
);

const IconClock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
);

const IconClipboard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconDocument = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconShield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconCheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconXCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconWarning = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

// ─── Componente de KPI Card ────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  accent: string; // Tailwind color classes
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, icon, accent, loading }) => (
  <div className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 overflow-hidden transition-shadow hover:shadow-md`}>
    {/* Faixa decorativa */}
    <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-2xl`} />
    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 ${accent.replace("bg-", "text-")}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
      ) : (
        <p className="text-3xl font-bold text-gray-800 mt-0.5 tabular-nums">{value}</p>
      )}
      {description && (
        <p className="text-xs text-gray-400 mt-1 truncate">{description}</p>
      )}
    </div>
  </div>
);

// ─── Componente de Seção ───────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-base font-bold text-gray-700 tracking-wide uppercase">{title}</h2>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    <div className="mt-2 h-0.5 bg-gradient-to-r from-blue-500 via-blue-300 to-transparent rounded-full" />
  </div>
);

// ─── Página Principal ───────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardMetrics()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setMetrics(data);
      })
      .catch(() => setError("Não foi possível carregar as métricas do dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <IconXCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Administrativo</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visão gerencial consolidada do PAPSE</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-3 py-1 font-medium self-start sm:self-auto">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Dados em tempo real
        </span>
      </div>

      {/* ── Seção 1: Pacientes ── */}
      <section>
        <SectionHeader title="Pacientes" subtitle="Distribuição por etapa de atendimento" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard
            loading={loading}
            title="Total Ativos"
            value={metrics?.pacientes.total ?? 0}
            description="Pacientes em atendimento"
            accent="bg-blue-500"
            icon={<IconUsers className="w-6 h-6" />}
          />
          <KpiCard
            loading={loading}
            title="Lista de Espera"
            value={metrics?.pacientes.listaEspera ?? 0}
            description="Aguardando vaga"
            accent="bg-amber-400"
            icon={<IconClock className="w-6 h-6" />}
          />
          <KpiCard
            loading={loading}
            title="Protocolo"
            value={metrics?.pacientes.protocolo ?? 0}
            description="Em atendimento protocolo"
            accent="bg-indigo-500"
            icon={<IconClipboard className="w-6 h-6" />}
          />
          <KpiCard
            loading={loading}
            title="Regular"
            value={metrics?.pacientes.regular ?? 0}
            description="Em atendimento regular"
            accent="bg-emerald-500"
            icon={<IconCheckCircle className="w-6 h-6" />}
          />
          <KpiCard
            loading={loading}
            title="Histórico"
            value={metrics?.pacientes.historico ?? 0}
            description="Desligados"
            accent="bg-gray-400"
            icon={<IconDocument className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* ── Seção 2: Indicadores Gerais ── */}
      <section>
        <SectionHeader title="Indicadores Gerais" subtitle="Sessões, relatórios, colaboradores e auditoria" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sessões */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <IconCheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sessões</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Realizadas", value: metrics?.sessoes.realizadas ?? 0, color: "text-emerald-600" },
                { label: "Total", value: metrics?.sessoes.total ?? 0, color: "text-gray-700" },
                { label: "Canceladas", value: metrics?.sessoes.canceladas ?? 0, color: "text-red-500" },
                { label: "Faltas", value: metrics?.sessoes.faltas ?? 0, color: "text-amber-500" },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{item.label}</p>
                  {loading ? (
                    <div className="h-6 w-10 bg-gray-200 animate-pulse rounded mt-1" />
                  ) : (
                    <p className={`text-xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Relatórios */}
          <KpiCard
            loading={loading}
            title="Relatórios Evolutivos"
            value={metrics?.relatorios.total ?? 0}
            description="Total registrado"
            accent="bg-violet-500"
            icon={<IconDocument className="w-6 h-6" />}
          />

          {/* Colaboradores */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <IconUsers className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colaboradores</h3>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-5 bg-gray-200 animate-pulse rounded" />)}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-sm font-bold text-gray-800 tabular-nums">{metrics?.colaboradores.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Bolsistas</span>
                  <span className="text-sm font-bold text-indigo-600 tabular-nums">{metrics?.colaboradores.bolsistas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Admins</span>
                  <span className="text-sm font-bold text-slate-600 tabular-nums">{metrics?.colaboradores.administradores}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auditoria em linha separada */}
        <div className="mt-4">
          <KpiCard
            loading={loading}
            title="Registros de Auditoria"
            value={metrics?.auditoria.total ?? 0}
            description="Total de eventos registrados no sistema"
            accent="bg-rose-500"
            icon={<IconShield className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* ── Seção 3: Pacientes por Bolsista ── */}
      <section>
        <SectionHeader
          title="Pacientes por Bolsista/Voluntário"
          subtitle="Carga atual de pacientes em Protocolo e Atendimento Regular"
        />
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center px-6 py-4 border-b border-gray-50 last:border-0">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
                <div className="ml-auto h-4 bg-gray-200 animate-pulse rounded w-12" />
              </div>
            ))}
          </div>
        ) : !metrics?.bolsistasPorPacientes.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16 gap-3">
            <IconWarning className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-400">Nenhum bolsista com pacientes ativos no momento.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header da tabela */}
            <div className="flex items-center px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
              <span className="flex-1">Bolsista / Voluntário(a)</span>
              <span className="w-32 text-right">Pacientes Ativos</span>
            </div>

            {/* Linhas */}
            {metrics.bolsistasPorPacientes.map((bolsista, idx) => {
              const maxPacientes = metrics.bolsistasPorPacientes[0]?.pacientes || 1;
              const pct = Math.round((bolsista.pacientes / maxPacientes) * 100);
              return (
                <div
                  key={bolsista.id}
                  className={`flex items-center px-6 py-4 border-b border-gray-50 last:border-0 gap-4 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50`}
                >
                  {/* Ranking */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-amber-100 text-amber-700" :
                    idx === 1 ? "bg-gray-100 text-gray-600" :
                      idx === 2 ? "bg-orange-100 text-orange-600" :
                        "bg-gray-50 text-gray-400"
                    }`}>
                    {idx + 1}
                  </div>

                  {/* Nome */}
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{bolsista.nome}</span>

                  {/* Barra de progresso proporcional */}
                  <div className="hidden sm:block w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Quantidade */}
                  <div className="flex-shrink-0 w-20 text-right">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold tabular-nums ${bolsista.pacientes > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                      }`}>
                      {bolsista.pacientes} {bolsista.pacientes === 1 ? "paciente" : "pacientes"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
