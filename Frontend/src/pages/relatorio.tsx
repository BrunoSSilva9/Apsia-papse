/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { unwrapApiResponse } from "../utils/apiResponse";
import { Search, FileText, User, ChevronRight, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { fetchInscricoes, getRelatoriosPorPaciente, getSessoesByPaciente } from "../services/api";

const Report = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [pastSessoes, setPastSessoes] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      setLoadingList(true);
      try {
        const response = await fetchInscricoes();
        const unwrapped = unwrapApiResponse<any[]>(response.data);
        const data = unwrapped.map((item: any) => item.paciente || item);

        const uniquePatients = Array.from(
          new Map(data.map((p: any) => [p.idPaciente, p])).values(),
        );
        setPatients(uniquePatients);
      } catch (error) {
        console.error("Erro ao carregar pacientes", error);
      } finally {
        setLoadingList(false);
      }
    };
    loadPatients();
  }, []);

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setLoadingReports(true);
    try {
      const [sessoesRes, relatoriosRes] = await Promise.all([
        getSessoesByPaciente(patient.idPaciente),
        getRelatoriosPorPaciente(patient.idPaciente)
      ]);
      const sessoes = unwrapApiResponse<any[]>(sessoesRes.data) || [];
      const relatorios = unwrapApiResponse<any[]>(relatoriosRes.data) || [];

      const relatoriosAvulsos = relatorios
        .filter((r) => !r.idSessao)
        .map((r) => ({
          idSessao: `rel_${r.idRelatorio}`,
          dataSessao: r.data_criacao,
          status: "RELATORIO_AVULSO",
          modalidade: "OUTRO",
          observacao: null,
          relatorio: { texto: r.texto },
          colaborador: r.colaborador,
        }));

      const merged = [...sessoes, ...relatoriosAvulsos].sort(
        (a, b) => new Date(b.dataSessao).getTime() - new Date(a.dataSessao).getTime()
      );

      setPastSessoes(merged);
    } catch (error) {
      console.error("Erro ao carregar relatórios/sessões", error);
      setPastSessoes([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 font-nunito">
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700 mb-3">Selecione o Paciente</h2>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingList ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Carregando...
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <button
                key={patient.idPaciente}
                onClick={() => handleSelectPatient(patient)}
                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${selectedPatient?.idPaciente === patient.idPaciente ? "bg-blue-50 text-blue-700 border border-blue-100" : "hover:bg-gray-50 text-gray-700 border border-transparent"}`}
              >
                <span className="font-medium truncate">{patient.nome}</span>
                <ChevronRight
                  size={16}
                  className={`text-gray-400 ${selectedPatient?.idPaciente === patient.idPaciente ? "text-blue-500" : ""}`}
                />
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {!selectedPatient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>Selecione um paciente ao lado para ver o histórico.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100 bg-blue-50">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedPatient.nome}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                  Matrícula: {selectedPatient.matricula}
                </span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {loadingReports ? (
                <div className="text-center py-10 text-gray-400">
                  Carregando relatórios...
                </div>
              ) : pastSessoes.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                  Nenhum registro encontrado para este paciente.
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {pastSessoes.map((sessao) => {
                    const statusLabel: Record<string, string> = {
                      REALIZADA: "Sessao realizada",
                      FALTA_JUSTIFICADA: "Falta justificada",
                      FALTA_NAO_JUSTIFICADA: "Falta nao justificada",
                      CANCELADA: "Cancelada",
                      RELATORIO_AVULSO: "Relatorio Avulso",
                    };
                    const statusColor: Record<string, string> = {
                      REALIZADA: "text-green-600 bg-green-50",
                      FALTA_JUSTIFICADA: "text-amber-600 bg-amber-50",
                      FALTA_NAO_JUSTIFICADA: "text-red-600 bg-red-50",
                      CANCELADA: "text-gray-500 bg-gray-100",
                      RELATORIO_AVULSO: "text-blue-600 bg-blue-50",
                    };
                    const dataFormatada = new Date(sessao.dataSessao).toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                    });
                    
                    return (
                      <div
                        key={sessao.idSessao}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={16} className="text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600">
                              {dataFormatada}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusColor[sessao.status] ?? "text-gray-600 bg-gray-100"}`}>
                            {statusLabel[sessao.status] ?? sessao.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-gray-50">
                          <User size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Responsável: <span className="font-medium text-gray-700">{sessao.colaborador?.nome || "Bolsista"}</span>
                          </span>
                        </div>
                        {sessao.relatorio ? (
                          <div className="mt-2">
                            <div className="flex items-center gap-1.5 mb-2">
                              <CheckCircle2 size={14} className="text-green-500" />
                              <span className="text-sm text-green-600 font-medium">Relatório disponível</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                              {sessao.relatorio.texto}
                            </p>
                          </div>
                        ) : (
                          sessao.status !== "REALIZADA" && sessao.status !== "RELATORIO_AVULSO" && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <XCircle size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-500">Sem relatorio clinico</span>
                            </div>
                          )
                        )}
                        {sessao.observacao && (
                          <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <p className="text-sm text-amber-800 italic">
                              <span className="font-semibold not-italic">Observação: </span>
                              {sessao.observacao}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Report;
