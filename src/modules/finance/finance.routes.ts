import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import * as financeController from "./finance.controller";

const router = Router();

router.use(authenticate);

router.post("/profile", financeController.upsertProfile);
router.get("/profile", financeController.getProfile);
router.get("/budget-division", financeController.getBudgetDivision);
router.get("/history", financeController.getHistory);

export default router;
