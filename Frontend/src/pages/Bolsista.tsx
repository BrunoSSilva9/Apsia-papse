/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  getProtocolos,
  getRegulares,
  getListaRegular,
  createSessao,
  getSessoesByPaciente,
  getRelatoriosPorPaciente,
} from "../services/api";
import { unwrapApiResponse } from "../utils/apiResponse";
import { useAuth } from "../hooks/useAuth";
import HeaderMenu from "../components/shared/HeaderMenu";
import Footer from "../components/shared/Footer";
import { toast } from "react-toastify";
import PatientCard from "../components/shared/PatientCard";
import { X, Send, User, FileText, Clock, CalendarDays, CheckCircle2, XCircle } from "lucide-react";

const Bolsista = () => {
  const [activeTab, setActiveTab] = useState<
    "protocolos" | "regulares" | "espera_regulares"
  >("protocolos");
  const [protocolos, setProtocolos] = useState<any[]>([]);
  const [regulares, setRegulares] = useState<any[]>([]);
  const [esperaRegulares, setEsperaRegulares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPatient, setReportPatient] = useState<any>(null);
  const [sessaoLoading, setSessaoLoading] = useState(false);

  const [sessaoData, setSessaoData] = useState("");
  const [sessaoStatus, setSessaoStatus] = useState("REALIZADA");
  const [sessaoModalidade, setSessaoModalidade] = useState("PRESENCIAL");
  const [sessaoTexto, setSessaoTexto] = useState("");
  const [sessaoObservacao, setSessaoObservacao] = useState("");

  const [pastSessoes, setPastSessoes] = useState<any[]>([]);
  const [loadingPastSessoes, setLoadingPastSessoes] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [protocolosResult, regularesResult, esperaRegularesResult] =
          await Promise.allSettled([
            getProtocolos(),
            getRegulares(),
            getListaRegular(),
          ]);

        const myId = String(user.idBolsista);
        const filterByBolsista = (item: any) => {
          const itemId = String(item.idBolsista);
          const itemColabId = item.colaborador
            ? String(item.colaborador.idBolsista)
            : null;
          return itemId === myId || itemColabId === myId;
        };

        if (protocolosResult.status === "fulfilled") {
          const rawProtocolos = unwrapApiResponse<any[]>(protocolosResult.value.data);
          const allProtocolos = Array.isArray(rawProtocolos) ? rawProtocolos : [];
          const myProtocolos = allProtocolos
            .filter(filterByBolsista)
            .map((item: any) => ({
              ...item.paciente,
              relationId: item.idProtocolo,
              motivo: item.paciente?.relato,
              dataInicio: item.data_inicio_atendimento,
            }));
          setProtocolos(myProtocolos);
        }

        if (regularesResult.status === "fulfilled") {
          const rawRegulares = unwrapApiResponse<any[]>(regularesResult.value.data);
          const allRegulares = Array.isArray(rawRegulares) ? rawRegulares : [];
          const myRegulares = allRegulares
            .filter(filterByBolsista)
            .map((item: any) => ({
              ...item.paciente,
              relationId: item.idRegular,
              motivo: item.paciente?.relato,
              dataInicio: item.data_inicio_atendimento,
            }));
          setRegulares(myRegulares);
        }

        if (esperaRegularesResult.status === "fulfilled") {
          const rawEspera = unwrapApiResponse<any[]>(esperaRegularesResult.value.data);
          const allEspera = Array.isArray(rawEspera) ? rawEspera : [];
          const myEsperaRegulares = allEspera
            .filter(filterByBolsista)
            .map((item: any) => ({
              ...item.paciente,
              relationId: item.idListaRegular,
              motivo: item.paciente?.relato,
            }));
          setEsperaRegulares(myEsperaRegulares);
        }
      } catch (error) {
        console.error("Erro geral ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const loadPastSessoes = async (patientId: number) => {
    setLoadingPastSessoes(true);
    try {
      const [sessoesRes, relatoriosRes] = await Promise.all([
        getSessoesByPaciente(patientId),
        getRelatoriosPorPaciente(patientId)
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
      console.error("Erro ao carregar sessoes anteriores:", error);
      setPastSessoes([]);
    } finally {
      setLoadingPastSessoes(false);
    }
  };

  const handleOpenReportModal = (patient: any) => {
    setReportPatient(patient);
    setSessaoData("");
    setSessaoStatus("REALIZADA");
    setSessaoModalidade("PRESENCIAL");
    setSessaoTexto("");
    setSessaoObservacao("");
    setPastSessoes([]);
    setShowReportModal(true);

    const patientId = patient.idPaciente || patient.id;
    if (patientId) {
      loadPastSessoes(patientId);
    }
  };

  const handleSubmitSessao = async () => {
    if (!sessaoData) return toast.warning("Informe a data da sessao.");
    if (sessaoStatus === "REALIZADA" && !sessaoTexto.trim())
      return toast.warning("O relatorio e obrigatorio para sessoes realizadas.");
    if (!user?.idBolsista) return toast.error("Usuario nao identificado. Faca login novamente.");

    setSessaoLoading(true);
    try {
      await createSessao({
        idPaciente: reportPatient.idPaciente || reportPatient.id,
        idBolsista: user.idBolsista,
        dataSessao: sessaoData,
        status: sessaoStatus,
        modalidade: sessaoModalidade,
        texto: sessaoStatus === "REALIZADA" ? sessaoTexto : undefined,
        observacao: sessaoObservacao || undefined,
      });
      toast.success(
        sessaoStatus === "REALIZADA"
          ? "Sessao e relatorio salvos com sucesso!"
          : "Registro de falta salvo com sucesso!"
      );
      setShowReportModal(false);
      loadPastSessoes(reportPatient.idPaciente || reportPatient.id);
    } catch (error) {
      console.error("Erro ao registrar sessao:", error);
      toast.error("Nao foi possivel salvar o atendimento no momento.");
    } finally {
      setSessaoLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 font-nunito flex flex-col">
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wide">
          APSIA | Painel do Bolsista
        </h1>
        <HeaderMenu variant="logged-in" />
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto p-8">
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-slate-800">
              Ola, {user?.nome}
            </h2>
            <p className="text-gray-600 mt-1">
              Gerencie seus atendimentos e pacientes abaixo.
            </p>
          </div>

          <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
            {[
              { id: "protocolos", label: `Protocolos (${protocolos.length})` },
              { id: "regulares", label: `Regulares (${regulares.length})` },
              {
                id: "espera_regulares",
                label: `Espera Regulares (${esperaRegulares.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center p-12 bg-white rounded-lg shadow text-gray-500">
                Carregando dados...
              </div>
            ) : (
              <>
                {activeTab === "protocolos" && (
                  <div className="grid grid-cols-1 gap-4">
                    {protocolos.map((patient, index) => (
                      <PatientCard
                        key={patient.idPaciente || index}
                        patient={patient}
                        index={index}
                        onAddRelatorio={handleOpenReportModal}
                        colorTheme="indigo"
                        showPosition={false}
                      />
                    ))}
                  </div>
                )}

                {activeTab === "regulares" && (
                  <div className="grid grid-cols-1 gap-4">
                    {regulares.map((patient, index) => (
                      <PatientCard
                        key={patient.idPaciente || index}
                        patient={patient}
                        index={index}
                        onAddRelatorio={handleOpenReportModal}
                        colorTheme="orange"
                        showPosition={false}
                      />
                    ))}
                  </div>
                )}

                {activeTab === "espera_regulares" && (
                  <div className="grid grid-cols-1 gap-4">
                    {esperaRegulares.map((patient, index) => (
                      <PatientCard
                        key={patient.idPaciente || index}
                        patient={patient}
                        index={index}
                        onAddRelatorio={handleOpenReportModal}
                        colorTheme="amber"
                        showPosition={false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showReportModal && reportPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
              <div className="px-6 py-5 bg-white border-b border-gray-100 flex justify-between items-start shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {reportPatient.nome}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Matricula: {reportPatient.matricula}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <div className="w-full md:w-1/2 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold">
                    <Clock size={20} />
                    <h3>Historico de Sessoes</h3>
                  </div>

                  {loadingPastSessoes ? (
                    <div className="text-center py-10 text-gray-500 text-sm">
                      Carregando historico...
                    </div>
                  ) : pastSessoes.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                      Nenhuma sessao registrada ainda.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastSessoes.map((sessao: any) => (
                        <div
                          key={sessao.idSessao}
                          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays size={13} className="text-gray-400" />
                              <span className="text-xs font-semibold text-gray-600">
                                {formatDate(sessao.dataSessao)}
                              </span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${statusColor[sessao.status] ?? "text-gray-600 bg-gray-100"}`}>
                              {statusLabel[sessao.status] ?? sessao.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            <User size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {sessao.colaborador?.nome || "Bolsista"}
                            </span>
                          </div>
                          {sessao.relatorio ? (
                            <div className="mt-2 border-t border-gray-100 pt-2">
                              <div className="flex items-center gap-1 mb-1">
                                <CheckCircle2 size={12} className="text-green-500" />
                                <span className="text-xs text-green-600 font-medium">Relatorio disponivel</span>
                              </div>
                              <p className="text-gray-700 text-xs whitespace-pre-wrap line-clamp-3">
                                {sessao.relatorio.texto}
                              </p>
                            </div>
                          ) : (
                            sessao.status !== "REALIZADA" && sessao.status !== "RELATORIO_AVULSO" && (
                              <div className="flex items-center gap-1 mt-1">
                                <XCircle size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-400">Sem relatorio clinico</span>
                              </div>
                            )
                          )}
                          {sessao.observacao && (
                            <p className="text-xs text-gray-500 italic mt-2 border-t border-gray-100 pt-2">
                              {sessao.observacao}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full md:w-1/2 bg-white p-6 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2 text-gray-700 font-bold">
                    <FileText size={20} />
                    <h3>Registrar Atendimento</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Data da Sessao *</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={sessaoData}
                      onChange={(e) => setSessaoData(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status *</label>
                    <select
                      value={sessaoStatus}
                      onChange={(e) => setSessaoStatus(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="REALIZADA">Sessao realizada</option>
                      <option value="FALTA_JUSTIFICADA">Falta justificada</option>
                      <option value="FALTA_NAO_JUSTIFICADA">Falta nao justificada</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Modalidade *</label>
                    <select
                      value={sessaoModalidade}
                      onChange={(e) => setSessaoModalidade(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="ONLINE">Online</option>
                      <option value="TELEFONE">Telefone</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>

                  {sessaoStatus === "REALIZADA" ? (
                    <div className="flex flex-col flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Relatorio Evolutivo *</label>
                      <textarea
                        value={sessaoTexto}
                        onChange={(e) => setSessaoTexto(e.target.value)}
                        placeholder="Descreva a evolucao do paciente na sessao de hoje..."
                        className="w-full flex-1 min-h-[140px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50 text-gray-700 placeholder-gray-400 text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Observacao Administrativa</label>
                      <textarea
                        value={sessaoObservacao}
                        onChange={(e) => setSessaoObservacao(e.target.value)}
                        placeholder="Motivo da falta, informacoes administrativas..."
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50 text-gray-700 placeholder-gray-400 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
                <button
                  onClick={handleSubmitSessao}
                  disabled={sessaoLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sessaoLoading ? (
                    "Salvando..."
                  ) : (
                    <>
                      Salvar <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="w-full bg-slate-900 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Bolsista;
