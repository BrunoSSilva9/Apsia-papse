/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  getProtocolos,
  getRegulares,
  getListaRegular,
  createRelatorio,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import HeaderMenu from "../components/shared/HeaderMenu";
import PatientCard from "../components/shared/PatientCard";
import { X, Send, User } from "lucide-react";

const Bolsista = () => {
  const [activeTab, setActiveTab] = useState<
    "protocolos" | "regulares" | "espera_regulares"
  >("protocolos");
  const [protocolos, setProtocolos] = useState<any[]>([]);
  const [regulares, setRegulares] = useState<any[]>([]);
  const [esperaRegulares, setEsperaRegulares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportPatient, setReportPatient] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

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
          const myProtocolos = protocolosResult.value.data
            .filter(filterByBolsista)
            .map((item: any) => ({
              ...item.paciente,
              relationId: item.idProtocolo,
              motivo: item.paciente.relato,
              dataInicio: item.data_inicio_atendimento,
            }));
          setProtocolos(myProtocolos);
        }

        if (regularesResult.status === "fulfilled") {
          const myRegulares = regularesResult.value.data
            .filter(filterByBolsista)
            .map((item: any) => ({
              ...item.paciente,
              relationId: item.idRegular,
              motivo: item.paciente.relato,
              dataInicio: item.data_inicio_atendimento,
            }));
          setRegulares(myRegulares);
        }

        if (esperaRegularesResult.status === "fulfilled") {
          const myEsperaRegulares = esperaRegularesResult.value.data
            .filter(filterByBolsista)
            .map((item: any) => ({
              ...item.paciente,
              relationId: item.idListaRegular,
              motivo: item.paciente.relato,
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

  const handleOpenReportModal = (patient: any) => {
    setReportPatient(patient);
    setReportText("");
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim())
      return alert("O texto do relatório não pode estar vazio.");
    if (!user?.idBolsista) return alert("Erro: Usuário não identificado.");

    setReportLoading(true);
    try {
      await createRelatorio({
        idPaciente: reportPatient.idPaciente || reportPatient.id,
        idBolsista: user.idBolsista,
        texto: reportText,
      });
      alert("Relatório salvo com sucesso!");
      setShowReportModal(false);
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      alert("Erro ao salvar o relatório.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wide">
          PAPSE | Painel do Bolsista
        </h1>
        <HeaderMenu variant="logged-in" />
      </header>

      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-slate-800">
            Olá, {user?.nome}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-5 bg-white border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {reportPatient.nome}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Adicionar relatório do atendimento
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Relatório
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Descreva a evolução do paciente..."
                className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSubmitReport}
                disabled={reportLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {reportLoading ? (
                  "Enviando..."
                ) : (
                  <>
                    Enviar <Send size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bolsista;
