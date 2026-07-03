import { z } from "zod";

export const createColaboradorSchema = z.object({
  body: z.object({
    nome: z.string().min(1, "Nome é obrigatório.").max(150),
    matricula: z.string().min(1, "Matrícula é obrigatória.").max(45),
    email: z.string().email("E-mail inválido.").max(255),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    role: z.enum(["COORDENADOR", "BOLSISTA"], { error: "Role é obrigatório." }),
    data_admissao: z.string().datetime().or(z.string().min(10)),
    data_saida: z.string().datetime().or(z.string().min(10)).optional().nullable(),
  }),
});

export const updateColaboradorSchema = z.object({
  body: z.object({
    nome: z.string().max(150).optional(),
    matricula: z.string().max(45).optional(),
    email: z.string().email().max(255).optional(),
    role: z.enum(["COORDENADOR", "BOLSISTA"]).optional(),
    data_admissao: z.string().datetime().or(z.string().min(10)).optional(),
    data_saida: z.string().datetime().or(z.string().min(10)).optional().nullable(),
  }),
});
