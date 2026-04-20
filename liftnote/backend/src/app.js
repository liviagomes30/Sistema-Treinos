require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./config/logger");

const app = express();

// ─── Middlewares globais ───────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── Logging Middleware Simples ───────────────────────────────
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, "Incoming request");
  next();
});

// ─── Rotas ────────────────────────────────────────────────────
app.use("/api", routes);

// ─── Health check ─────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ─── Handler de erros global (deve ser o último middleware) ───
app.use(errorHandler);

// ─── Conexão com MongoDB e start do servidor ──────────────────
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => logger.info(`🚀 Servidor rodando na porta ${PORT}`));
});
