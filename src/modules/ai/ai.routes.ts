import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { aiLimiter } from "../../middlewares/rateLimit.middleware";
import * as aiController from "./ai.controller";

const router = Router();

router.use(authenticate);

// Rate limit especial para IA (caro por requisição)
router.post("/recommend", aiLimiter, aiController.generateRecommendation);

export default router;
