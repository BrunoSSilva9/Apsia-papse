import { z } from "zod";

export const createHistoricoSchema = z.object({
  body: z.object({
    idPaciente: z.number().int().positive().or(z.string().transform(Number)),
    id_ultimo_bolsista: z.number().int().positive().or(z.string().transform(Number)),
    data_desligamento: z.string().datetime().or(z.string().min(10)),
  }),
});
