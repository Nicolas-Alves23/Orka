import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import passport from "./config/passport";

// Rotas
import authRoutes from "./modules/auth/auth.routes";
import financeRoutes from "./modules/finance/finance.routes";
import aiRoutes from "./modules/ai/ai.routes";

const app = express();

// Segurança
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === "production"
    ? [env.FRONTEND_URL]
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

// Session (apenas para o handshake OAuth do Google)
app.use(session({
  secret: env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000, // 10 min — suficiente para o fluxo OAuth
  },
}));
app.use(passport.initialize());

// Parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limit global
app.use("/api", apiLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Rota não encontrada" });
});

// Error handler global (deve ser o último middleware)
app.use(errorHandler);

export default app;
