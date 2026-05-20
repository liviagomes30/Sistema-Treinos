const { z } = require("zod");

const getSessionsSchema = z.object({
  query: z.object({
    workout_id: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    page: z.coerce.number().int().min(1).optional().default(1),
  }),
});

const createSessionSchema = z.object({
  body: z.object({
    workout_id: z.string().min(1, "workout_id é obrigatório"),
    gym_place_id: z.string().optional().nullable(),
    gym_name: z.string().max(200).optional().nullable(),
    gym_address: z.string().max(500).optional().nullable(),
  }),
});

const updateSessionSchema = z.object({
  body: z.object({
    ai_summary: z.string().optional().nullable(),
    status: z.enum(["active", "completed"]).optional(),
    endTime: z.string().optional(),
    gym_place_id: z.string().optional().nullable(),
    gym_name: z.string().max(200).optional().nullable(),
    gym_address: z.string().max(500).optional().nullable(),
  }),
});

module.exports = {
  getSessionsSchema,
  createSessionSchema,
  updateSessionSchema,
};
