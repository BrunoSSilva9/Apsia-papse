import { z } from "zod";

export const paramIdPacienteSchema = z.object({
  params: z.object({
    idPaciente: z.string().regex(/^\d+$/, "ID do paciente deve ser um número inteiro positivo."),
  }),
});
