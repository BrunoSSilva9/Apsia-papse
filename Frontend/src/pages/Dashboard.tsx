import React, { useEffect, useState } from "react";
import { getDashboardMetrics } from "../services/api";
import type { DashboardMetrics, DashboardPeriod } from "../types";

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

const IconUserPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const IconChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── Configuração dos períodos ─────────────────────────────────────────────

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "mes",       label: "Este mês" },
  { value: "trimestre", label: "Último trimestre" },
  { value: "semestre",  label: "Último semestre" },
  { value: "ano",       label: "Este ano" },
  { value: "total",     label: "Todos os períodos" },
];

// ─── Componente de KPI Card ────────────────────────────────────────────────
// Correção: removido `truncate` do título e descrição para permitir quebra de linha.

interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  accent: string;
  loading?: boolean;
  badge?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, icon, accent, loading, badge }) => (
  <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-3 overflow-hidden transition-shadow hover:shadow-md">
    {/* Faixa decorativa */}
    <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-2xl`} />
    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 ${accent.replace("bg-", "text-")}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-snug">{title}</p>
        {badge && (
          <span className="flex-shrink-0 text-[10px] bg-blue-50 text-blue-500 border border-blue-100 rounded-full px-1.5 py-0.5 font-semibold whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-14 bg-gray-200 animate-pulse rounded mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800 mt-0.5 tabular-nums">{value}</p>
      )}
      {description && (
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
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

// ─── Seletor de Período ────────────────────────────────────────────────────

interface PeriodSelectorProps {
  value: DashboardPeriod;
  onChange: (p: DashboardPeriod) => void;
  loading: boolean;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange, loading }) => (
  <div className="flex flex-wrap gap-1.5">
    {PERIOD_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        id={`period-btn-${opt.value}`}
        disabled={loading}
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
          value === opt.value
            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
            : "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ─── Utilidade: label do período para badges ───────────────────────────────

function periodLabel(period: DashboardPeriod): string {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "";
}

// ─── Página Principal ───────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<DashboardPeriod>("mes");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Accordion: guarda o id do bolsista expandido (null = nenhum)
  const [expandedBolsista, setExpandedBolsista] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setExpandedBolsista(null); // fecha accordion ao trocar período
    getDashboardMetrics(period)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setMetrics(data);
      })
      .catch(() => setError("Não foi possível carregar as métricas do dashboard."))
      .finally(() => setLoading(false));
  }, [period]);

  const toggleBolsista = (id: number) => {
    setExpandedBolsista((prev) => (prev === id ? null : id));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <IconXCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  const badge = periodLabel(period);

  return (
    <div className="space-y-10">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Administrativo</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visão gerencial consolidada do PAPSE</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-3 py-1 font-medium">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Dados em tempo real
          </span>
          <PeriodSelector value={period} onChange={setPeriod} loading={loading} />
        </div>
      </div>

      {/* ── Seção 1: Pacientes ── */}
      <section>
        <SectionHeader title="Pacientes" subtitle="Distribuição por etapa de atendimento" />
        {/* Grid com altura uniforme: items-stretch garante cards do mesmo tamanho */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
          <KpiCard
            loading={loading}
            title="Total Ativos"
            value={metrics?.pacientes.total ?? 0}
            description="Protocolo + Regular"
            accent="bg-blue-500"
            icon={<IconUsers className="w-5 h-5" />}
          />
          <KpiCard
            loading={loading}
            title="Novos Inscritos"
            value={metrics?.pacientes.novosInscritos ?? 0}
            description="Inscrições no período"
            accent="bg-teal-500"
            icon={<IconUserPlus className="w-5 h-5" />}
            badge={badge}
          />
          <KpiCard
            loading={loading}
            title="Lista de Espera"
            value={metrics?.pacientes.listaEspera ?? 0}
            description="Aguardando vaga"
            accent="bg-amber-400"
            icon={<IconClock className="w-5 h-5" />}
          />
          <KpiCard
            loading={loading}
            title="Protocolo"
            value={metrics?.pacientes.protocolo ?? 0}
            description="Em atendimento"
            accent="bg-indigo-500"
            icon={<IconClipboard className="w-5 h-5" />}
          />
          <KpiCard
            loading={loading}
            title="Regular"
            value={metrics?.pacientes.regular ?? 0}
            description="Em atendimento"
            accent="bg-emerald-500"
            icon={<IconCheckCircle className="w-5 h-5" />}
          />
          <KpiCard
            loading={loading}
            title="Histórico"
            value={metrics?.pacientes.historico ?? 0}
            description="Desligados"
            accent="bg-gray-400"
            icon={<IconDocument className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* ── Seção 2: Indicadores Gerais ── */}
      <section>
        <SectionHeader
          title="Indicadores Gerais"
          subtitle={`Sessões, relatórios e colaboradores — período: ${badge}`}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sessões */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <IconCheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sessões</h3>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-500 border border-blue-100 rounded-full px-2 py-0.5 font-semibold">
                {badge}
              </span>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <IconDocument className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Relatórios</h3>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-500 border border-blue-100 rounded-full px-2 py-0.5 font-semibold">
                {badge}
              </span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-800 tabular-nums">{metrics?.relatorios.total ?? 0}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Relatórios evolutivos</p>
          </div>

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
                  <span className="text-xs text-gray-500">Total ativos</span>
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
            description="Total acumulado de eventos registrados no sistema"
            accent="bg-rose-500"
            icon={<IconShield className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* ── Seção 3: Pacientes por Bolsista ── */}
      <section>
        <SectionHeader
          title="Pacientes por Bolsista/Voluntário"
          subtitle="Carga atual em Protocolo e Atendimento Regular — clique para expandir"
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

            {/* Linhas com accordion */}
            {metrics.bolsistasPorPacientes.map((bolsista, idx) => {
              const maxPacientes = metrics.bolsistasPorPacientes[0]?.pacientes || 1;
              const pct = Math.round((bolsista.pacientes / maxPacientes) * 100);
              const isExpanded = expandedBolsista === bolsista.id;
              const hasPacientes = bolsista.pacientes > 0;

              return (
                <div key={bolsista.id} className="border-b border-gray-50 last:border-0">
                  {/* Linha principal — clicável */}
                  <button
                    id={`bolsista-row-${bolsista.id}`}
                    onClick={() => hasPacientes && toggleBolsista(bolsista.id)}
                    disabled={!hasPacientes}
                    className={`w-full flex items-center px-6 py-4 gap-4 text-left transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } ${hasPacientes ? "hover:bg-blue-50 cursor-pointer" : "cursor-default"} ${
                      isExpanded ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* Ranking */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? "bg-amber-100 text-amber-700" :
                      idx === 1 ? "bg-gray-100 text-gray-600" :
                      idx === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Nome */}
                    <span className="flex-1 text-sm font-medium text-gray-800 text-left">{bolsista.nome}</span>

                    {/* Barra de progresso */}
                    <div className="hidden sm:block w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Quantidade */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold tabular-nums ${
                        bolsista.pacientes > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                      }`}>
                        {bolsista.pacientes} {bolsista.pacientes === 1 ? "paciente" : "pacientes"}
                      </span>
                      {hasPacientes && (
                        <IconChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </button>

                  {/* Painel accordion com lista de pacientes */}
                  {isExpanded && hasPacientes && (
                    <div className="bg-blue-50/60 border-t border-blue-100 px-6 py-3">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                        Pacientes em atendimento
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {bolsista.pacientesList.map((p) => (
                          <div
                            key={`${p.tipo}-${p.id}`}
                            className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-blue-100/70"
                          >
                            <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              p.tipo === "Protocolo"
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}>
                              {p.tipo === "Protocolo" ? "PROT" : "REG"}
                            </span>
                            <span className="text-xs text-gray-700 font-medium leading-tight">{p.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
