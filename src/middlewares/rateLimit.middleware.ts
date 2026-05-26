import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();

    if (!store[key] || now > store[key].resetTime) {
      store[key] = { count: 1, resetTime: now + options.windowMs };
      return next();
    }

    store[key].count++;

    if (store[key].count > options.max) {
      return res.status(429).json({
        success: false,
        message: options.message || "Muitas requisições. Tente novamente mais tarde.",
      });
    }

    next();
  };
}

// Rate limits pré-configurados
export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Muitas tentativas de login." });
export const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: "Limite de requisições de IA atingido." });
