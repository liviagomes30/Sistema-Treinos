const { z } = require("zod");

const createLogSchema = z.object({
  body: z.object({
    workout_exercise_id: z.string().min(1, "workout_exercise_id é obrigatório"),
    set_number: z.number().int().min(1, "set_number inválido"),
    reps_done: z.number().int().min(0, "reps_done não pode ser negativo").optional(),
    weight_used_kg: z.number().min(0, "weight_used_kg não pode ser negativo").optional().nullable(),
    notes: z.string().max(500, "Máximo de 500 caracteres").optional().nullable(),
  }),
});

const updateLogSchema = z.object({
  body: z.object({
    reps_done: z.number().int().min(0).optional(),
    weight_used_kg: z.number().min(0).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
  }),
});

module.exports = {
  createLogSchema,
  updateLogSchema,
};
