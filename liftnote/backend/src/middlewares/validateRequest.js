const { ZodError } = require("zod");

const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log('validateRequest hit, type of next:', typeof next); try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Sobrescreve o req com os dados validados (e tipados)
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;

      return next();
    } catch (err) {
      if (err instanceof ZodError || err.name === "ZodError") {
        return res.status(400).json({
          message: "Erro de validação",
          details: (err.issues || err.errors || []).map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return next(err);
    }
  };
};

module.exports = validateRequest;
