import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as aiService from "./ai.service";
import { success } from "../../utils/response";

export async function generateRecommendation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await aiService.generateRecommendation(req.user!.userId);
    success(res, result, 200, "Recomendação gerada com sucesso");
  } catch (err) {
    next(err);
  }
}
// teste