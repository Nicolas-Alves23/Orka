import { count, eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { financialProfiles, aiRecommendations } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";

interface FinancialProfileDTO {
  monthlyIncome: number;
  monthlyExpenses?: number;
  riskProfile?: "conservador" | "moderado" | "arrojado";
  mainGoal?: "reserva_emergencia" | "aposentadoria" | "viagem" | "imovel" | "outro";
  hasEmergencyFund?: boolean;
}

export async function upsertProfile(userId: string, data: FinancialProfileDTO) {
  const existing = await db.query.financialProfiles.findFirst({
    where: eq(financialProfiles.userId, userId),
  });

  const payload = {
    monthlyIncome: String(data.monthlyIncome),
    monthlyExpenses: data.monthlyExpenses !== undefined ? String(data.monthlyExpenses) : undefined,
    riskProfile: data.riskProfile,
    mainGoal: data.mainGoal,
    hasEmergencyFund: data.hasEmergencyFund,
  };

  if (existing) {
    const [updated] = await db
      .update(financialProfiles)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(financialProfiles.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(financialProfiles)
    .values({ userId, ...payload })
    .returning();

  return created;
}

export async function getProfile(userId: string) {
  const profile = await db.query.financialProfiles.findFirst({
    where: eq(financialProfiles.userId, userId),
  });

  if (!profile) throw new NotFoundError("Perfil financeiro");

  return profile;
}

export function calculateBudgetDivision(income: number, expenses: number = 0) {
  const available = income - expenses;

  // Regra 50/30/20 adaptada
  return {
    essencial: {
      valor: expenses || income * 0.5,
      percentual: expenses ? Math.round((expenses / income) * 100) : 50,
      descricao: "Gastos essenciais (moradia, alimentação, transporte)",
    },
    investimento: {
      valor: Math.round(available * 0.4 * 100) / 100,
      percentual: Math.round(((available * 0.4) / income) * 100),
      descricao: "Investimentos e formação de patrimônio",
    },
    lazer: {
      valor: Math.round(available * 0.3 * 100) / 100,
      percentual: Math.round(((available * 0.3) / income) * 100),
      descricao: "Lazer, cultura e bem-estar",
    },
    reserva: {
      valor: Math.round(available * 0.3 * 100) / 100,
      percentual: Math.round(((available * 0.3) / income) * 100),
      descricao: "Reserva de emergência (meta: 6x seus gastos mensais)",
    },
  };
}

export async function getRecommendationHistory(userId: string, page: number, limit: number) {
  const [items, [{ total }]] = await Promise.all([
    db.query.aiRecommendations.findMany({
      where: eq(aiRecommendations.userId, userId),
      orderBy: [desc(aiRecommendations.createdAt)],
      limit,
      offset: (page - 1) * limit,
    }),
    db
      .select({ total: count() })
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId)),
  ]);

  return { items, total };
}
