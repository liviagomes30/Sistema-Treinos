const { z } = require("zod");

const analyzeSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, "sessionId é obrigatório"),
  }),
});

const analyzeProgressSchema = z.object({
  params: z.object({
    catalogId: z.string().min(1, "catalogId é obrigatório"),
  }),
});

module.exports = {
  analyzeSessionSchema,
  analyzeProgressSchema,
};
