import { pgTable, uuid, varchar, text, numeric, timestamp, pgEnum, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const riskProfileEnum = pgEnum("risk_profile", ["conservador", "moderado", "arrojado"]);
export const goalEnum = pgEnum("goal", ["reserva_emergencia", "aposentadoria", "viagem", "imovel", "outro"]);

// Tabela de usuários
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Perfil financeiro do usuário
export const financialProfiles = pgTable("financial_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }).notNull(),
  monthlyExpenses: numeric("monthly_expenses", { precision: 12, scale: 2 }).default("0"),
  riskProfile: riskProfileEnum("risk_profile").default("moderado"),
  mainGoal: goalEnum("main_goal").default("reserva_emergencia"),
  hasEmergencyFund: boolean("has_emergency_fund").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recomendações geradas pela IA
export const aiRecommendations = pgTable("ai_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }).notNull(),
  budgetDivision: jsonb("budget_division").notNull(),       // { essencial, investimento, lazer, reserva }
  recommendations: jsonb("recommendations").notNull(),       // array de investimentos sugeridos
  aiSummary: text("ai_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relações
export const usersRelations = relations(users, ({ one, many }) => ({
  financialProfile: one(financialProfiles, {
    fields: [users.id],
    references: [financialProfiles.userId],
  }),
  recommendations: many(aiRecommendations),
}));

export const financialProfilesRelations = relations(financialProfiles, ({ one }) => ({
  user: one(users, {
    fields: [financialProfiles.userId],
    references: [users.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [aiRecommendations.userId],
    references: [users.id],
  }),
}));
