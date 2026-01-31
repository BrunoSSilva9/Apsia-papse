/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Search, FileText, User, Calendar, ChevronRight } from "lucide-react";
import { fetchInscricoes, getRelatoriosPorPaciente } from "../services/api";

interface Relatorio {
  idRelatorio: number;
  texto: string;
  data_criacao: string;
  colaborador: {
    nome: string;
    matricula: string;
  };
}

const Report = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      setLoadingList(true);
      try {
        const response = await fetchInscricoes();
        const data = response.data.map((item: any) => item.paciente || item);

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
      const response = await getRelatoriosPorPaciente(patient.idPaciente);
      setRelatorios(response.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios", error);
      setRelatorios([]);
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
              ) : relatorios.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                  Nenhum relatório encontrado para este paciente.
                </div>
              ) : (
                <div className="space-y-6">
                  {relatorios.map((relatorio) => (
                    <div
                      key={relatorio.idRelatorio}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700">
                              {relatorio.colaborador.nome}
                            </p>
                            <p className="text-xs text-gray-400">
                              Bolsista Responsável
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          <Calendar size={12} />
                          {new Date(relatorio.data_criacao).toLocaleDateString(
                            "pt-BR",
                          )}{" "}
                          às{" "}
                          {new Date(relatorio.data_criacao).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      </div>

                      <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {relatorio.texto}
                      </div>
                    </div>
                  ))}
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
