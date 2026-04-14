const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Erro interno do servidor";
  let errors = null;

  // Erro de validação do Mongoose (campos inválidos)
  if (err.name === "ValidationError") {
    status = 400;
    message = "Dados inválidos";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Documento não encontrado pelo Mongoose
  if (err.name === "DocumentNotFoundError") {
    status = 404;
    message = "Recurso não encontrado";
  }

  // ID com formato inválido (ObjectId malformado)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    status = 400;
    message = `ID inválido: ${err.value}`;
  }

  // Violação de campo único (ex: e-mail duplicado)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `O valor do campo "${field}" já está em uso`;
  }

  // Token JWT inválido
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Token inválido";
  }

  // Token JWT expirado
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expirado. Faça login novamente";
  }

  // Log no servidor (apenas erros inesperados)
  if (status === 500) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );
    console.error(err.stack);
  }

  const response = { message };
  if (errors) response.errors = errors;

  // Em desenvolvimento, expõe o stack trace
  if (process.env.NODE_ENV === "development" && status === 500) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = errorHandler;
