/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type InternalAxiosRequestConfig,
  type AxiosRequestHeaders,
} from "axios";

import { toast } from "react-toastify";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000/api"
    : "https://api.projetopapse.org/api");

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("@Papse:token");
  if (!config.headers) config.headers = {} as AxiosRequestHeaders;
  if (token) {
    (config.headers as AxiosRequestHeaders)["Authorization"] =
      `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      const message = data?.message || "Erro na comunicação com o servidor.";

      switch (status) {
        case 400:
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err: any) => toast.error(err.message || "Erro de validação"));
          } else {
            toast.error(message);
          }
          break;
        case 401:
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          localStorage.removeItem("@Papse:token");
          localStorage.removeItem("@Papse:user");
          window.location.href = "/login";
          break;
        case 403:
          toast.warning(message || "Acesso negado.");
          break;
        case 429:
          toast.warning("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
          break;
        case 500:
          toast.error("Erro interno do servidor. Tente novamente mais tarde.");
          break;
        default:
          toast.error(message);
          break;
      }
    } else {
      toast.error("Erro de conexão. Verifique sua internet.");
    }
    return Promise.reject(error);
  }
);

export const fetchInscricoes = (status: string | null = null) => {
  if (status === "lista_de_espera") return getListaEspera();
  if (status === "espera_regulares") return getListaRegular();
  if (status === "atendimento_protocolo") return getProtocolos();
  if (status === "atendimento_regular") return getRegulares();
  if (status === "historico") return getHistorico();

  return api.get("/pacientes");
};

export const createInscricao = (data: any) => api.post("/pacientes", data);
export const updateInscricao = (id: number, data: any) =>
  api.put(`/pacientes/${id}`, data);
export const getInscricaoById = (id: number) => api.get(`/pacientes/${id}`);

export const getListaEspera = () => api.get("/listaespera");
export const createListaEspera = (data: any) => api.post("/listaespera", data);
export const deleteListaEspera = (id: number) =>
  api.delete(`/listaespera/${id}`);

export const getListaRegular = () => api.get("/listaregular");
export const createListaRegular = (data: any) =>
  api.post("/listaregular", data);
export const deleteListaRegular = (id: number) =>
  api.delete(`/listaregular/${id}`);
export const updateListaRegular = (id: number, data: any) =>
  api.put(`/listaregular/${id}`, data);

export const getProtocolos = () => api.get("/protocolos");
export const createProtocolo = (data: any) => api.post("/protocolos", data);
export const deleteProtocolo = (id: number) => api.delete(`/protocolos/${id}`);
export const updateProtocolo = (id: number, data: any) =>
  api.put(`/protocolos/${id}`, data);

export const getRegulares = () => api.get("/regular");
export const createRegular = (data: any) => api.post("/regular", data);
export const deleteRegular = (id: number) => api.delete(`/regular/${id}`);
export const updateRegular = (id: number, data: any) =>
  api.put(`/regular/${id}`, data);

export const getBolsistas = () => api.get("/colaboradores");
export const createColaborador = (data: any) =>
  api.post("/colaboradores", data);
export const deleteColaborador = (id: number) =>
  api.delete(`/colaboradores/${id}`);

export const getHistorico = () => api.get("/historico");
export const deleteHistorico = (id: number) => api.delete(`/historico/${id}`);

export const createRelatorio = (data: any) => api.post("/relatorios", data);
export const getRelatoriosPorPaciente = (idPaciente: number) =>
  api.get(`/relatorios/${idPaciente}`);

export const createSessao = (data: any) => api.post("/sessoes", data);
export const getSessoesByPaciente = (idPaciente: number) =>
  api.get(`/sessoes/${idPaciente}`);

export const getProntuario = (idPaciente: number) =>
  api.get(`/prontuario/${idPaciente}`);

export default api;
