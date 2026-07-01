import { z } from "zod";

export const createPacienteSchema = z.object({
  body: z.object({
    nome: z.string().min(1, "Nome é obrigatório.").max(150),
    email: z.string().email("E-mail inválido.").max(255),
    matricula: z.string().min(1, "Matrícula é obrigatória.").max(45),
    data_nascimento: z.string().datetime({ message: "Data de nascimento inválida (use ISO string)." }).or(z.string().min(10)),
    data_inscricao: z.string().datetime().or(z.string().min(10)),
    telefone: z.string().max(15).optional(),
    relato: z.string().max(500).optional(),
    curso: z.string().max(150).optional(),
    recaptchaToken: z.string().min(1, "Token de reCAPTCHA ausente."),
  }),
});

export const updatePacienteSchema = z.object({
  body: z.object({
    nome: z.string().max(150).optional(),
    email: z.string().email().max(255).optional(),
    matricula: z.string().max(45).optional(),
    telefone: z.string().max(15).optional(),
    relato: z.string().max(500).optional(),
    curso: z.string().max(150).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
