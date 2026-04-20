const { z } = require("zod");

const createWorkoutSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório").max(100, "Máximo de 100 caracteres"),
    description: z.string().max(500, "Máximo de 500 caracteres").optional().nullable(),
  }),
});

const updateWorkoutSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório").max(100, "Máximo de 100 caracteres").optional(),
    description: z.string().max(500, "Máximo de 500 caracteres").optional().nullable(),
  }),
});

module.exports = {
  createWorkoutSchema,
  updateWorkoutSchema,
};
