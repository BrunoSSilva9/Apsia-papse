export type Role = "ADMIN" | "BOLSISTA";

export interface Colaborador {
  idBolsista: number;
  nome: string;
  matricula: string;
  role: Role;
  data_admissao: string;
}

export interface AuthResponse {
  token: string;
  colaborador?: Colaborador;
  usuario?: Colaborador;
  user?: Colaborador;
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

export type CardColor = "blue" | "amber" | "darkblue" | "coral" | "purple";
export type CardIcon =
  | "users"
  | "clipboard"
  | "document"
  | "refresh"
  | "shield";

export interface WaitingList {
  id: number;
  title: string;
  description: string;
  color: CardColor;
  icon: CardIcon;
  to?: string;
}

export interface WaitingListCardProps {
  title: string;
  description: string;
  color: CardColor;
  icon: CardIcon;
  to?: string;
}
