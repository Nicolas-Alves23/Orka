import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { aiRecommendations, financialProfiles } from "../../db/schema";
import { getInvestmentOptions, InvestmentOption } from "../investments/investments.service";
import { calculateBudgetDivision } from "../finance/finance.service";
import { NotFoundError } from "../../utils/errors";
import { env } from "../../config/env";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

interface AIRecommendationResult {
  budgetDivision: ReturnType<typeof calculateBudgetDivision>;
  recommendations: InvestmentOption[];
  aiSummary: string;
}

export async function generateRecommendation(userId: string): Promise<AIRecommendationResult> {
  // Busca perfil
  const profile = await db.query.financialProfiles.findFirst({
    where: eq(financialProfiles.userId, userId),
  });

  if (!profile) throw new NotFoundError("Perfil financeiro");

  const income = Number(profile.monthlyIncome);
  const expenses = Number(profile.monthlyExpenses || 0);
  const riskProfile = profile.riskProfile || "moderado";
  const mainGoal = profile.mainGoal || "reserva_emergencia";

  // Calcula divisão do orçamento
  const budgetDivision = calculateBudgetDivision(income, expenses);
  const investmentAmount = budgetDivision.investimento.valor;

  // Busca opções de investimento
  const recommendations = await getInvestmentOptions(riskProfile, investmentAmount);

  // Gera análise personalizada com IA
  const prompt = `
Você é um assessor financeiro brasileiro especialista e empático. 
Analise o perfil abaixo e gere um resumo personalizado em português brasileiro (máximo 3 parágrafos, tom amigável e motivador):

PERFIL DO USUÁRIO:
- Renda mensal: R$ ${income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Gastos mensais: R$ ${expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Disponível para investir: R$ ${investmentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Perfil de risco: ${riskProfile}
- Objetivo principal: ${mainGoal.replace(/_/g, " ")}
- Tem reserva de emergência: ${profile.hasEmergencyFund ? "sim" : "não"}

DIVISÃO DO ORÇAMENTO SUGERIDA:
- Essencial: R$ ${budgetDivision.essencial.valor.toLocaleString("pt-BR")} (${budgetDivision.essencial.percentual}%)
- Investimento: R$ ${budgetDivision.investimento.valor.toLocaleString("pt-BR")} (${budgetDivision.investimento.percentual}%)
- Lazer: R$ ${budgetDivision.lazer.valor.toLocaleString("pt-BR")} (${budgetDivision.lazer.percentual}%)
- Reserva: R$ ${budgetDivision.reserva.valor.toLocaleString("pt-BR")} (${budgetDivision.reserva.percentual}%)

Dê insights específicos sobre o objetivo "${mainGoal}" e como os investimentos sugeridos ajudam a alcançá-lo.
Seja direto, prático e motivador. Não use markdown.
  `.trim();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const aiSummary = (message.content[0] as { text: string }).text;

  // Salva no banco
  await db.insert(aiRecommendations).values({
    userId,
    monthlyIncome: String(income),
    budgetDivision,
    recommendations,
    aiSummary,
  });

  return { budgetDivision, recommendations, aiSummary };
}
