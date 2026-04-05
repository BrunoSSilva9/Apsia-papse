/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Info, ChevronRight, Send, X, User } from "lucide-react";
import {
  fetchInscricoes,
  createProtocolo,
  createListaEspera,
  deleteListaEspera,
  deleteListaRegular,
  deleteProtocolo,
  deleteRegular,
  getBolsistas,
  createListaRegular,
  createRegular,
  updateProtocolo,
  updateRegular,
  updateListaRegular,
  getHistorico,
  deleteHistorico,
  createRelatorio,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import PatientCard from "../components/shared/PatientCard";

interface Transition {
  label: string;
  target: string;
}
interface PatientListProps {
  status: string;
  title: string;
  transitions?: Transition[];
  canEncerrar?: boolean;
}

const PatientList = ({
  status,
  title,
  transitions = [],
  canEncerrar = true,
}: PatientListProps) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getTheme = () => {
    switch (status) {
      case "lista_de_espera":
        return { name: "blue", bg: "bg-blue-600", text: "text-blue-600" };
      case "espera_regulares":
        return { name: "amber", bg: "bg-amber-500", text: "text-amber-600" };
      case "atendimento_protocolo":
        return { name: "indigo", bg: "bg-indigo-600", text: "text-indigo-600" };
      case "atendimento_regular":
        return { name: "orange", bg: "bg-orange-500", text: "text-orange-600" };
      default:
        return { name: "blue", bg: "bg-gray-600", text: "text-gray-600" };
    }
  };
  const theme = getTheme();

  const [bolsistas, setBolsistas] = useState<any[]>([]);
  const [showBolsistaModal, setShowBolsistaModal] = useState(false);
  const [selectedBolsista, setSelectedBolsista] = useState("");
  const [pendingTransition, setPendingTransition] = useState<{
    patient: any;
    targetStatus: string;
  } | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportPatient, setReportPatient] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const { user } = useAuth();

  const loadBolsistas = useCallback(async () => {
    try {
      const response = await getBolsistas();
      const filtered = response.data.filter(
        (b: any) => b.role?.toUpperCase() === "BOLSISTA" && !b.data_saida,
      );
      setBolsistas(filtered);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchInscricoes(status);
      const mapped = response.data.map((item: any) => {
        if (!item.paciente) return { ...item, motivo: item.relato };

        let relationId;
        if (status === "lista_de_espera")
          relationId = item.idListaEspera || item.id;
        else if (status === "espera_regulares")
          relationId = item.idListaRegular || item.id;
        else if (status === "atendimento_protocolo")
          relationId = item.idProtocolo || item.id;
        else if (status === "atendimento_regular")
          relationId = item.idRegular || item.id;
        else if (status === "historico")
          relationId = item.idHistorico || item.id;

        return {
          ...item.paciente,
          relationId,
          motivo: item.paciente.relato,
          bolsistaNome: item.colaborador?.nome,
        };
      });
      setPatients(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadPatients();
    if (user?.role?.toUpperCase() === "ADMIN") loadBolsistas();
  }, [status, user, loadPatients, loadBolsistas]);

  const deleteCurrent = async (patient: any) => {
    if (status === "lista_de_espera")
      await deleteListaEspera(patient.relationId);
    else if (status === "espera_regulares")
      await deleteListaRegular(patient.relationId);
    else if (status === "atendimento_protocolo")
      await deleteProtocolo(patient.relationId);
    else if (status === "atendimento_regular")
      await deleteRegular(patient.relationId);
  };

  const removePatientFromHistory = async (patientId: number) => {
    try {
      const response = await getHistorico();
      const records = response.data.filter(
        (h: any) =>
          h.idPaciente === patientId ||
          (h.paciente && h.paciente.idPaciente === patientId),
      );
      if (records.length > 0) {
        records.sort((a: any, b: any) => b.idHistorico - a.idHistorico);
        await deleteHistorico(records[0].idHistorico);
      }
    } catch (error) {
      console.error("Erro cleanup histórico:", error);
    }
  };

  const handleTransition = async (
    patient: any,
    targetStatus: string,
    assignedBolsistaId: string | null = null,
  ) => {
    const bolsistaId = assignedBolsistaId
      ? parseInt(String(assignedBolsistaId))
      : user?.idBolsista;
    const patientId = patient.idPaciente || patient.id;
    if (!bolsistaId) return alert("Erro: Bolsista não identificado.");

    try {
      if (status === targetStatus) {
        const payload = { idBolsista: bolsistaId, idPaciente: patientId };
        if (status === "atendimento_protocolo")
          await updateProtocolo(patient.relationId, payload);
        else if (status === "atendimento_regular")
          await updateRegular(patient.relationId, payload);
        else if (status === "espera_regulares")
          await updateListaRegular(patient.relationId, payload);
        loadPatients();
        alert("Bolsista atualizado com sucesso!");
        return;
      }
      if (targetStatus === "lista_de_espera") {
        await createListaEspera({ idPaciente: patientId });
        await deleteCurrent(patient);
        await removePatientFromHistory(patientId);
      } else if (targetStatus === "atendimento_protocolo") {
        await createProtocolo({
          idPaciente: patientId,
          idBolsista: bolsistaId,
          data_inicio_atendimento: new Date().toISOString(),
          qtde_sessoes: 0,
        });
        await deleteCurrent(patient);
        await removePatientFromHistory(patientId);
      } else if (targetStatus === "espera_regulares") {
        if (status === "lista_de_espera")
          await createListaRegular({
            idPaciente: patientId,
            idBolsista: bolsistaId,
          });
        else {
          await createListaEspera({ idPaciente: patientId });
          await createListaRegular({
            idPaciente: patientId,
            idBolsista: bolsistaId,
          });
          await deleteCurrent(patient);
          await removePatientFromHistory(patientId);
        }
      } else if (targetStatus === "atendimento_regular") {
        if (status === "lista_de_espera" || status === "espera_regulares")
          await createRegular({
            idPaciente: patientId,
            idBolsista: bolsistaId,
            data_inicio_atendimento: new Date().toISOString(),
            qtde_sessoes: 0,
          });
        else {
          await createListaEspera({ idPaciente: patientId });
          await createRegular({
            idPaciente: patientId,
            idBolsista: bolsistaId,
            data_inicio_atendimento: new Date().toISOString(),
            qtde_sessoes: 0,
          });
          await deleteCurrent(patient);
          await removePatientFromHistory(patientId);
        }
      }
      setPatients(patients.filter((p) => (p.idPaciente || p.id) !== patientId));
      alert("Movimentação realizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar a ação.");
    }
  };

  const initiateTransition = async (patient: any, targetStatus: string) => {
    const requiresBolsista = [
      "atendimento_protocolo",
      "espera_regulares",
      "atendimento_regular",
    ].includes(targetStatus);
    const isAdmin = user?.role?.toUpperCase() === "ADMIN";
    if (isAdmin && requiresBolsista) {
      if (bolsistas.length === 0) await loadBolsistas();
      setPendingTransition({ patient, targetStatus });
      setShowBolsistaModal(true);
    } else {
      handleTransition(patient, targetStatus);
    }
  };

  const confirmBolsistaSelection = () => {
    if (pendingTransition && selectedBolsista) {
      handleTransition(
        pendingTransition.patient,
        pendingTransition.targetStatus,
        selectedBolsista,
      );
      setShowBolsistaModal(false);
      setPendingTransition(null);
      setSelectedBolsista("");
    }
  };

  const handleEncerrar = async (patient: any) => {
    if (confirm("Tem certeza que deseja encerrar a inscrição?")) {
      try {
        await deleteCurrent(patient);
        setPatients(
          patients.filter(
            (p) =>
              (p.idPaciente || p.id) !== (patient.idPaciente || patient.id),
          ),
        );
        alert("Inscrição encerrada com sucesso.");
      } catch (error) {
        console.error("Erro ao encerrar:", error);
        alert("Erro ao encerrar a inscrição.");
      }
    }
  };

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

  const cardTransitions = transitions.map((t) => ({
    label: t.label,
    action: (p: any) => initiateTransition(p, t.target),
  }));
  const filteredPatients = patients.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full font-nunito">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span className="font-bold text-blue-900 text-lg">PAPSE</span>
        <span className="mx-2 text-gray-300">|</span>
        <Link to="/admin" className="hover:text-blue-700">
          Painel Administrativo
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="font-semibold text-gray-800">{title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block w-48 shrink-0">
          <div className="flex items-center gap-2 font-bold text-gray-700 mb-4 cursor-pointer hover:text-blue-600">
            <div className="bg-gray-200 p-1 rounded">
              <ChevronRight size={16} />
            </div>{" "}
            <Link to="/admin" className="hover:text-blue-700">
              Outras listas
            </Link>
          </div>
        </div>

        <div className="flex-1">
          <div
            className={`${theme.bg} rounded-xl p-8 mb-6 text-white shadow-lg relative overflow-hidden`}
          >
            <div className="relative z-10">
              <h1 className="text-3xl font-normal">
                <span className="font-bold text-4xl mr-2">
                  {patients.length}
                </span>{" "}
                pessoas na {title.toLowerCase()}
              </h1>
            </div>
            <div className="absolute bottom-4 right-4 opacity-80">
              <Info size={24} />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquise aqui"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700"
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Carregando pacientes...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
              Nenhum paciente encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {filteredPatients.map((patient, index) => (
                <PatientCard
                  key={patient.idPaciente || index}
                  patient={patient}
                  index={index}
                  colorTheme={theme.name}
                  onEncaminhar={
                    cardTransitions.length > 0 ? cardTransitions : undefined
                  }
                  onEncerrar={canEncerrar ? handleEncerrar : undefined}
                  onAddRelatorio={
                    status !== "lista_de_espera"
                      ? handleOpenReportModal
                      : undefined
                  }
                  showPosition={status === "lista_de_espera"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showBolsistaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <h3 className={`text-lg font-bold mb-4 ${theme.text}`}>
              Selecione o Bolsista
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Selecione o novo bolsista responsável.
            </p>
            <select
              value={selectedBolsista}
              onChange={(e) => setSelectedBolsista(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-6 outline-none focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              {bolsistas.map((b) => (
                <option key={b.idBolsista} value={b.idBolsista}>
                  {b.nome}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBolsistaModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBolsistaSelection}
                className={`px-4 py-2 text-white rounded font-medium transition-colors ${theme.bg} hover:opacity-90`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Corpo do Modal */}
            <div className="p-6 bg-gray-50">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Relatório
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Escrever relatório..."
                className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-white text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Footer do Modal */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSubmitReport}
                disabled={reportLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
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

export default PatientList;
