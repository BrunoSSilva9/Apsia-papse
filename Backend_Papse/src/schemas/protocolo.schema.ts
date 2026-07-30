import { z } from "zod";

export const createProtocoloSchema = z.object({
  body: z.object({
    idPaciente: z.number().int().positive().or(z.string().transform(Number)),
    idBolsista: z.number().int().positive().or(z.string().transform(Number)),
    qtde_sessoes: z.number().int().nonnegative().optional(),
    data_inicio_atendimento: z.string().datetime().or(z.string().min(10)),
  }),
});

export const updateProtocoloSchema = z.object({
  body: z.object({
    idBolsista: z.number().int().positive().or(z.string().transform(Number)).optional(),
    qtde_sessoes: z.number().int().nonnegative().optional(),
    data_inicio_atendimento: z.string().datetime().or(z.string().min(10)).optional(),
  }),
});
