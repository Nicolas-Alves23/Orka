import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as financeService from "./finance.service";
import { success } from "../../utils/response";

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
    const history = await financeService.getRecommendationHistory(req.user!.userId);
    success(res, history);
  } catch (err) {
    next(err);
  }
}
