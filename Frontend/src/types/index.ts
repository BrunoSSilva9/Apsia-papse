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

// ─── Dashboard ──────────────────────────────────────────────────────────────

export type DashboardPeriod = "mes" | "trimestre" | "semestre" | "ano" | "total";

export interface PacienteResumo {
  id: number;
  nome: string;
  tipo: "Protocolo" | "Regular";
}

export interface BolsistaPacientes {
  id: number;
  nome: string;
  pacientes: number;
  pacientesList: PacienteResumo[];
}

export interface DashboardMetrics {
  period: DashboardPeriod;
  pacientes: {
    total: number;
    listaEspera: number;
    protocolo: number;
    regular: number;
    historico: number;
    novosInscritos: number;
  };
  colaboradores: {
    total: number;
    bolsistas: number;
    administradores: number;
  };
  sessoes: {
    realizadas: number;
    canceladas: number;
    faltas: number;
    total: number;
  };
  relatorios: {
    total: number;
  };
  auditoria: {
    total: number;
  };
  bolsistasPorPacientes: BolsistaPacientes[];
}
