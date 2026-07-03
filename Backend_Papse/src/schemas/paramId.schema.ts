import { z } from "zod";

export const paramIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID deve ser um número inteiro positivo."),
  }),
});
