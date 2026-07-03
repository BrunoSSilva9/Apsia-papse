import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Trata ZodError
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Erro de validação nos dados enviados.",
      errors: err.issues.map((e: any) => ({
        campo: e.path.join("."),
        mensagem: e.message,
      })),
    });
  }

  // Trata AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }),
      ...(err.details && { details: err.details }),
    });
  }


  // Trata Erros do Prisma
  if (err.name === "PrismaClientKnownRequestError" || err.code?.startsWith("P")) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Conflito: Registro já existente.",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Registro não encontrado.",
      });
    }
  }

  // Log do erro inesperado no console
  console.error("🔥 Erro inesperado:", err);

  // Erro Inesperado (500)
  const isProduction = process.env.NODE_ENV === "production";
  
  return res.status(500).json({
    success: false,
    message: "Ocorreu um erro interno no servidor.",
    ...( !isProduction && { error: err.message, stack: err.stack } )
  });
}
