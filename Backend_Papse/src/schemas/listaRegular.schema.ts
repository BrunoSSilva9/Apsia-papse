import { z } from "zod";

export const createListaRegularSchema = z.object({
  body: z.object({
    idPaciente: z.number().int().positive().or(z.string().transform(Number)),
    idBolsista: z.number().int().positive().or(z.string().transform(Number)),
    encaminhamento: z.string().max(255).optional().nullable(),
  }),
});
