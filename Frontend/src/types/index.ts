export type Role = "ADMIN" | "BOLSISTA";

export interface Colaborador {
  idBolsista: number;
  nome: string;
  matricula: string;
  role: Role;
  data_admissao: string;
}

export interface Paciente {
  idPaciente: number;
  nome: string;
  matricula: string;
  data_nascimento: string;
  telefone?: string;
  curso?: string;
  relato?: string;
}

export interface AuthResponse {
  token: string;
  usuario?: Colaborador;
  colaborador?: Colaborador;
  user?: Colaborador;
}
