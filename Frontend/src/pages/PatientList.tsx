/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Info, ChevronRight } from "lucide-react";
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
        return { name: "amber", bg: "bg-amber-500", text: "text-amber-600" }; // Amber é o amarelo escuro
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
  const { user } = useAuth();

  const loadBolsistas = useCallback(async () => {
    try {
      const response = await getBolsistas();
      const filtered = response.data.filter(
        (b: any) => b.role?.toUpperCase() === "BOLSISTA",
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
        if (status === "lista_de_espera") relationId = item.idListaEspera;
        else if (status === "espera_regulares")
          relationId = item.idListaRegular;
        else if (status === "atendimento_protocolo")
          relationId = item.idProtocolo;
        else if (status === "atendimento_regular") relationId = item.idRegular;
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

  const handleTransition = async (
    patient: any,
    targetStatus: string,
    assignedBolsistaId: string | null = null,
  ) => {
    const bolsistaId = assignedBolsistaId
      ? parseInt(assignedBolsistaId)
      : user?.idBolsista;
    const patientId = patient.idPaciente || patient.id;
    if (!bolsistaId) return alert("Erro: Bolsista não identificado.");
    try {
      if (targetStatus === "lista_de_espera") {
        await createListaEspera({ idPaciente: patientId });
        await deleteCurrent(patient);
      } else if (targetStatus === "atendimento_protocolo") {
        await createProtocolo({
          idPaciente: patientId,
          idBolsista: bolsistaId,
          data_inicio_atendimento: new Date().toISOString(),
          qtde_sessoes: 0,
        });
        await deleteCurrent(patient);
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
        }
      }
      setPatients(patients.filter((p) => (p.idPaciente || p.id) !== patientId));
      alert("Sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao transferir.");
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
    if (confirm("Encerrar?")) {
      await deleteCurrent(patient);
      setPatients(patients.filter((p) => p.id !== patient.id));
    }
  };

  const cardTransitions = transitions.map((t) => ({
    label: t.label,
    action: (p: any) => initiateTransition(p, t.target),
  }));

  // Filtro de pesquisa
  const filteredPatients = patients.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full font-nunito">
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Outras listas
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
                </span>
                pessoas na {title.toLowerCase()}
              </h1>
            </div>

            <div className="absolute bottom-4 right-4 opacity-80">
              <Info size={24} />
            </div>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquise aqui"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700"
            />
          </div>

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
                  showPosition={status === "lista_de_espera"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showBolsistaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className={`text-lg font-bold mb-4 ${theme.text}`}>
              Selecione o Bolsista
            </h3>
            <select
              value={selectedBolsista}
              onChange={(e) => setSelectedBolsista(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-6"
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBolsistaSelection}
                className={`px-4 py-2 text-white rounded font-medium ${theme.bg}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
