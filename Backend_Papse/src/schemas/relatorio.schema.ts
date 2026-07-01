import { z } from "zod";

export const createRelatorioSchema = z.object({
  body: z.object({
    idPaciente: z.number().int().positive().or(z.string().transform(Number)),
    idBolsista: z.number().int().positive().or(z.string().transform(Number)),
    texto: z.string().min(1, "O texto do relatório não pode estar vazio.").max(10000),
  }),
});
