import { z } from "zod";

export const createListaEsperaSchema = z.object({
  body: z.object({
    idPaciente: z.number().int().positive().or(z.string().transform(Number)),
  }),
});
