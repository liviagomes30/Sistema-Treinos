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

const weeklyCoachSchema = z.object({
  query: z.object({
    weeks: z
      .string()
      .optional()
      .refine((v) => !v || [2, 4, 8, 12].includes(Number(v)), {
        message: "weeks deve ser 2, 4, 8 ou 12",
      }),
  }),
});

module.exports = {
  analyzeSessionSchema,
  analyzeProgressSchema,
  weeklyCoachSchema,
};
