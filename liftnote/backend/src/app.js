require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./config/logger");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(helmet());
app.use(compression());
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "http://localhost:5173",
];
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)) }));
app.use(express.json());

app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, "Incoming request");
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica o status da API
 *     description: Retorna um objeto indicando que a API está rodando
 *     responses:
 *       200:
 *         description: Sucesso
 */
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => logger.info(`🚀 Servidor rodando na porta ${PORT}`));
});
