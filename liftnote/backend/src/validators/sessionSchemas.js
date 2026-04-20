const { z } = require("zod");

const getSessionsSchema = z.object({
  query: z.object({
    workout_id: z.string().optional(),
    status: z.enum(["in_progress", "completed", "cancelled"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    page: z.coerce.number().int().min(1).optional().default(1),
  }),
});

const createSessionSchema = z.object({
  body: z.object({
    workout_id: z.string().min(1, "workout_id é obrigatório"),
  }),
});

const updateSessionSchema = z.object({
  body: z.object({
    status: z.enum(["in_progress", "completed", "cancelled"]).optional(),
    ai_summary: z.string().optional().nullable(),
  }),
});

module.exports = {
  getSessionsSchema,
  createSessionSchema,
  updateSessionSchema,
};
