import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as financeService from "./finance.service";
import { success, paginated } from "../../utils/response";

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

const profileSchema = z.object({
  monthlyIncome: z.number().positive("Renda deve ser positiva"),
  monthlyExpenses: z.number().min(0).optional(),
  riskProfile: z.enum(["conservador", "moderado", "arrojado"]).optional(),
  mainGoal: z.enum(["reserva_emergencia", "aposentadoria", "viagem", "imovel", "outro"]).optional(),
  hasEmergencyFund: z.boolean().optional(),
});

export async function upsertProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = profileSchema.parse(req.body);
    const profile = await financeService.upsertProfile(req.user!.userId, data);
    success(res, profile, 200, "Perfil financeiro salvo");
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await financeService.getProfile(req.user!.userId);
    success(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function getBudgetDivision(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await financeService.getProfile(req.user!.userId);
    const division = financeService.calculateBudgetDivision(
      Number(profile.monthlyIncome),
      Number(profile.monthlyExpenses || 0)
    );
    success(res, division);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = historyQuerySchema.parse(req.query);
    const { items, total } = await financeService.getRecommendationHistory(req.user!.userId, page, limit);
    paginated(res, items, { page, limit, total });
  } catch (err) {
    next(err);
  }
}
