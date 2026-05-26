import app from "./app";
import { env } from "./config/env";

const PORT = Number(env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 FinanceIA Backend rodando!`);
  console.log(`   Porta:      ${PORT}`);
  console.log(`   Ambiente:   ${env.NODE_ENV}`);
  console.log(`   Health:     http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM recebido. Encerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor encerrado com sucesso");
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  process.exit(1);
});
