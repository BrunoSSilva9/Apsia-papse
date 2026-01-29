/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { getProtocolos, getRegulares, getListaRegular } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import HeaderMenu from "../components/shared/HeaderMenu";
import PatientCard from "../components/shared/PatientCard";

const Bolsista = () => {
  const [activeTab, setActiveTab] = useState<
    "protocolos" | "regulares" | "espera_regulares"
  >("protocolos");
  const [protocolos, setProtocolos] = useState<any[]>([]);
  const [regulares, setRegulares] = useState<any[]>([]);
  const [esperaRegulares, setEsperaRegulares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
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
              {activeTab === "protocolos" &&
                (protocolos.length === 0 ? (
                  <div className="text-center p-12 bg-white rounded-lg shadow text-gray-500">
                    Você não possui atendimentos de protocolo.
                  </div>
                ) : (
                  protocolos.map((patient, index) => (
                    <PatientCard
                      key={patient.idPaciente || index}
                      patient={patient}
                      index={index}
                    />
                  ))
                ))}

              {activeTab === "regulares" &&
                (regulares.length === 0 ? (
                  <div className="text-center p-12 bg-white rounded-lg shadow text-gray-500">
                    Você não possui atendimentos regulares.
                  </div>
                ) : (
                  regulares.map((patient, index) => (
                    <PatientCard
                      key={patient.idPaciente || index}
                      patient={patient}
                      index={index}
                    />
                  ))
                ))}

              {activeTab === "espera_regulares" &&
                (esperaRegulares.length === 0 ? (
                  <div className="text-center p-12 bg-white rounded-lg shadow text-gray-500">
                    Você não possui pacientes na lista de espera regular.
                  </div>
                ) : (
                  esperaRegulares.map((patient, index) => (
                    <PatientCard
                      key={patient.idPaciente || index}
                      patient={patient}
                      index={index}
                    />
                  ))
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bolsista;
