import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

import pacienteRoutes from "./routes/paciente.routes.js";
import protocoloRoutes from "./routes/protocolo.routes.js";
import colaboradorRoutes from "./routes/colaborador.routes.js";
import listaEsperaRoutes from "./routes/listaEspera.routes.js";
import listaRegularRoutes from "./routes/listaRegular.routes.js";
import regularRoutes from "./routes/regular.routes.js";
import historicoRoutes from "./routes/historico.routes.js";
import authRoutes from "./routes/auth.routes.js";
import relatorioRoutes from "./routes/relatorio.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import sessaoRoutes from "./routes/sessao.routes.js";
import prontuarioRoutes from "./routes/prontuario.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

console.log("✅ server.ts foi carregado");

const app = express();
const PORT = process.env.PORT || 3000;

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERRO FATAL: Variável de ambiente obrigatória não definida: ${envVar}`);
    process.exit(1);
  }
}

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origem não permitida pelo CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

import { errorHandler } from "./middlewares/errorHandler.middleware.js";

app.use("/api", authRoutes);

app.use("/api", pacienteRoutes);
app.use("/api", protocoloRoutes);
app.use("/api", colaboradorRoutes);
app.use("/api", listaEsperaRoutes);
app.use("/api", listaRegularRoutes);
app.use("/api", regularRoutes);
app.use("/api", historicoRoutes);
app.use("/api/relatorios", relatorioRoutes);
app.use("/api", sessaoRoutes);
app.use("/api", prontuarioRoutes);
app.use("/api/auditoria", auditRoutes);
app.use("/api", dashboardRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API está funcionando!" });
});

// Health check — sem autenticação
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      message: "API saudável.",
    });
  } catch {
    res.status(503).json({
      success: false,
      data: {
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      message: "Falha na conexão com o banco de dados.",
    });
  }
});

// Middleware Global de Erro (deve vir depois de todas as rotas)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
