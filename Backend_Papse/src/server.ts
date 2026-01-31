import express from "express";
import cors from "cors";

import pacienteRoutes from "./routes/paciente.routes.js";
import protocoloRoutes from "./routes/protocolo.routes.js";
import colaboradorRoutes from "./routes/colaborador.routes.js";
import listaEsperaRoutes from "./routes/listaEspera.routes.js";
import listaRegularRoutes from "./routes/listaRegular.routes.js";
import regularRoutes from "./routes/regular.routes.js";
import historicoRoutes from "./routes/historico.routes.js";
import authRoutes from "./routes/auth.routes.js";
import relatorioRoutes from "./routes/relatorio.routes.js";

console.log("✅ server.ts foi carregado");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use("/api", authRoutes);

app.use("/api", pacienteRoutes);
app.use("/api", protocoloRoutes);
app.use("/api", colaboradorRoutes);
app.use("/api", listaEsperaRoutes);
app.use("/api", listaRegularRoutes);
app.use("/api", regularRoutes);
app.use("/api", historicoRoutes);
app.use("/api/relatorios", relatorioRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API está funcionando!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
