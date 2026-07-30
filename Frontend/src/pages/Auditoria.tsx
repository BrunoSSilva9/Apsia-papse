import { useState, useEffect } from "react";
import api from "../services/api";
import { unwrapApiResponse } from "../utils/apiResponse";
import { FileText, Search, User } from "lucide-react";

const actionMap: Record<string, string> = {
  LOGIN_SUCESSO: "Login realizado com sucesso",
  FALHA_LOGIN: "Tentativa de login sem sucesso",
  CRIAR_PACIENTE: "Paciente cadastrado",
  ATUALIZAR_PACIENTE: "Dados do paciente atualizados",
  INATIVAR_PACIENTE: "Paciente inativado",
  CRIAR_LISTA_ESPERA: "Paciente adicionado à lista de espera",
  ARQUIVAR_LISTA_ESPERA: "Registro removido da lista de espera",
  CRIAR_LISTA_REGULAR: "Paciente adicionado à lista regular",
  ARQUIVAR_LISTA_REGULAR: "Registro removido da lista regular",
  CRIAR_PROTOCOLO: "Paciente movido para protocolo",
  ARQUIVAR_PROTOCOLO: "Protocolo arquivado",
  CRIAR_REGULAR: "Paciente movido para atendimento regular",
  ARQUIVAR_REGULAR: "Atendimento regular arquivado",
  CRIAR_RELATORIO: "Relatório evolutivo criado",
  ATUALIZAR_RELATORIO: "Relatório evolutivo atualizado",
  EXCLUIR_RELATORIO: "Relatório evolutivo removido",
  CRIAR_COLABORADOR: "Colaborador cadastrado",
  ATUALIZAR_COLABORADOR: "Dados do colaborador atualizados",
  INATIVAR_COLABORADOR: "Colaborador inativado"
};

const entityMap: Record<string, string> = {
  Colaborador: "Usuário/colaborador",
  RelatorioEvolutivo: "Relatório evolutivo",
  ListaEspera: "Lista de espera",
  ListaRegular: "Lista regular",
  Protocolo: "Protocolo de atendimento",
  Regular: "Atendimento regular",
  Historico: "Histórico",
  Paciente: "Paciente"
};

const formatAction = (action: string) => {
  if (!action) return "-";
  return actionMap[action] || action.replace(/_/g, " ");
};

const formatEntity = (entity: string) => {
  if (!entity) return "-";
  return entityMap[entity] || entity;
};

const getBadgeStyle = (action: string) => {
  if (!action) return "bg-gray-100 text-gray-700 border border-gray-200";
  const upper = action.toUpperCase();
  if (upper === "LOGIN_SUCESSO") return "bg-teal-50 text-teal-700 border border-teal-200";
  if (upper === "FALHA_LOGIN") return "bg-red-50 text-red-700 border border-red-200";
  if (upper.includes("CRIAR")) return "bg-green-50 text-green-700 border border-green-200";
  if (upper.includes("ATUALIZAR") || upper.includes("MOVER")) return "bg-blue-50 text-blue-700 border border-blue-200";
  if (upper.includes("ARQUIVAR") || upper.includes("INATIVAR") || upper.includes("EXCLUIR")) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-gray-100 text-gray-700 border border-gray-200";
};

export default function Auditoria() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroAcao, setFiltroAcao] = useState("");
  const [filtroEntidade, setFiltroEntidade] = useState("");

  const carregarLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/auditoria?page=${page}&limit=50&acao=${filtroAcao}&entidade=${filtroEntidade}`);
      const unwrapped = unwrapApiResponse<any>(response.data);
      setLogs(unwrapped.logs || []);
      setTotalPages(unwrapped.pagination?.totalPages || 1);
    } catch (error) {
      // O interceptor cuidará do toast
      console.error("Erro ao carregar auditoria:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLogs();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    carregarLogs();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#23397e] flex items-center">
            <FileText className="mr-2" size={28} />
            Logs de Auditoria
          </h1>
          <p className="text-gray-600">Registro de ações do sistema</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Evento</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Ex: LOGIN_SUCESSO, CRIAR_PACIENTE..."
            value={filtroAcao}
            onChange={(e) => setFiltroAcao(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Ex: Paciente, Colaborador..."
            value={filtroEntidade}
            onChange={(e) => setFiltroEntidade(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-[#5773D3] text-white px-6 py-2 rounded font-medium hover:bg-[#23397e] flex items-center"
        >
          <Search size={18} className="mr-2" /> Filtrar
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm">
                <th className="p-4 font-semibold">Data/Hora</th>
                <th className="p-4 font-semibold">Evento</th>
                <th className="p-4 font-semibold">Módulo</th>
                <th className="p-4 font-semibold">Registro afetado</th>
                <th className="p-4 font-semibold">Usuário responsável</th>
                <th className="p-4 font-semibold">IP de origem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Carregando logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.idLog} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                    <td className="p-4 text-gray-600">
                      {new Date(log.data_hora).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      <span className={`px-2 py-1 rounded text-[11px] uppercase tracking-wider font-bold shadow-sm ${getBadgeStyle(log.acao)}`}>
                        {formatAction(log.acao)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{formatEntity(log.entidade)}</td>
                    <td className="p-4 text-gray-600">
                      {log.entidadeId ? `ID: ${log.entidadeId}` : "-"}
                      {log.pacienteNome ? (
                        <span className="block text-xs text-blue-600 font-medium">Pac: {log.pacienteNome} (ID: {log.pacienteId})</span>
                      ) : (
                        log.pacienteId && <span className="block text-xs text-gray-400">Pac: {log.pacienteId}</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 flex flex-col justify-center">
                      <div className="flex items-center">
                        <User size={14} className="mr-1 text-gray-400" />
                        {log.bolsistaNome ? (
                          <span className="font-medium text-gray-800">{log.bolsistaNome}</span>
                        ) : (
                          <span>{log.idBolsista ? log.idBolsista : "Sistema/Público"}</span>
                        )}
                        {log.role && <span className="ml-2 text-[10px] bg-gray-200 px-1 rounded uppercase">{log.role}</span>}
                      </div>
                      {log.bolsistaNome && log.idBolsista && (
                         <span className="text-xs text-gray-400 ml-5">ID: {log.idBolsista}</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-mono">{log.ip_origem || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded text-sm disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
