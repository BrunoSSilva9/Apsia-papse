import { type Request, type Response, type NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;
      // Sobrescrevemos o req.body com os dados validados/sanitizados
      req.body = validatedData.body;
      req.query = validatedData.query as any;
      req.params = validatedData.params as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Erro de validação de dados.",
          errors: error.issues,
        });
      }
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  };
};
