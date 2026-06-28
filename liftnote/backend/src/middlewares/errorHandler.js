const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `O campo ${field} já está em uso.` });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: "Erro de validação", details: messages });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Token inválido" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expirado" });
  }

  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Erro interno no servidor";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
