import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { env } from "../config/env";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Dados inválidos",
      errors: err.flatten().fieldErrors,
    });
  }

  // App errors (operacionais)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Erros inesperados
  console.error("💥 Erro inesperado:", err);

  return res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
