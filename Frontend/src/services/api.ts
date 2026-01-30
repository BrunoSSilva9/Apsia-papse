/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type InternalAxiosRequestConfig,
  type AxiosRequestHeaders,
} from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3001/api";

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

export const getProtocolos = () => api.get("/protocolos");
export const createProtocolo = (data: any) => api.post("/protocolos", data);
export const deleteProtocolo = (id: number) => api.delete(`/protocolos/${id}`);

export const getRegulares = () => api.get("/regular");
export const createRegular = (data: any) => api.post("/regular", data);
export const deleteRegular = (id: number) => api.delete(`/regular/${id}`);

export const getBolsistas = () => api.get("/colaboradores");
export const createColaborador = (data: any) =>
  api.post("/colaboradores", data);
export const deleteColaborador = (id: number) =>
  api.delete(`/colaboradores/${id}`);

export const getHistorico = () => api.get("/historico");
export default api;
