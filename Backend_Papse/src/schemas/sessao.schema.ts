import { z } from "zod";

const StatusSessaoEnum = z.enum([
  "REALIZADA",
  "FALTA_JUSTIFICADA",
  "FALTA_NAO_JUSTIFICADA",
  "CANCELADA",
]);

const ModalidadeSessaoEnum = z.enum([
  "PRESENCIAL",
  "ONLINE",
  "TELEFONE",
  "OUTRO",
]);

export const createSessaoSchema = z.object({
  body: z
    .object({
      idPaciente: z.number().int().positive().or(z.string().transform(Number)),
      idBolsista: z.number().int().positive().or(z.string().transform(Number)),
      dataSessao: z.string().min(10, "Data da sessao e obrigatoria."),
      status: StatusSessaoEnum,
      modalidade: ModalidadeSessaoEnum,
      duracao: z.number().int().positive().optional(),
      observacao: z.string().max(500).optional(),
      texto: z.string().min(1).max(10000).optional(),
    })
    .refine(
      (data) => {
        if (data.status === "REALIZADA") {
          return !!data.texto && data.texto.trim().length > 0;
        }
        return true;
      },
      {
        message: "O relatorio e obrigatorio para sessoes com status REALIZADA.",
        path: ["texto"],
      }
    ),
});

export const paramIdPacienteSessaoSchema = z.object({
  params: z.object({
    idPaciente: z.string().transform(Number),
  }),
});
