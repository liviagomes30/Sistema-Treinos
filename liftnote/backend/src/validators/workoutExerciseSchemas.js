const { z } = require("zod");
const { SET_TYPES } = require("../constants/enums");

const pyramidSetSchema = z.object({
  set_number: z.number().int().min(1),
  reps: z.number().int().min(1),
  weight_kg: z.number().min(0),
});

const createWorkoutExerciseSchema = z.object({
  body: z.object({
    exercise_catalog_id: z.string().min(1, "exercise_catalog_id é obrigatório"),
    custom_name: z.string().max(100).optional().nullable(),
    set_type: z.enum(SET_TYPES).optional().default("linear"),
    series: z.number().int().min(1).max(20).optional().nullable(),
    reps: z.number().int().min(1).optional().nullable(),
    weight_kg: z.number().min(0).max(1000).optional().default(0),
    rest_seconds: z.number().int().min(0).optional().default(60),
    no_rest: z.boolean().optional().default(false),
    notes: z.string().max(500).optional().nullable(),
    order: z.number().int().min(0).optional(),
    is_optional: z.boolean().optional().default(false),
    pyramid_sets: z.array(pyramidSetSchema).optional().default([]),
  }),
});

const updateWorkoutExerciseSchema = z.object({
  body: z.object({
    custom_name: z.string().max(100).optional().nullable(),
    set_type: z.enum(SET_TYPES).optional(),
    series: z.number().int().min(1).max(20).optional().nullable(),
    reps: z.number().int().min(1).optional().nullable(),
    weight_kg: z.number().min(0).max(1000).optional(),
    rest_seconds: z.number().int().min(0).optional(),
    no_rest: z.boolean().optional(),
    notes: z.string().max(500).optional().nullable(),
    order: z.number().int().min(0).optional(),
    is_optional: z.boolean().optional(),
    pyramid_sets: z.array(pyramidSetSchema).optional(),
  }),
});

const reorderWorkoutExerciseSchema = z.object({
  body: z.array(
    z.object({
      id: z.string().min(1, "id é obrigatório"),
      order: z.number().int().min(0, "ordem inválida"),
    })
  ).nonempty("O array não pode ser vazio"),
});

module.exports = {
  createWorkoutExerciseSchema,
  updateWorkoutExerciseSchema,
  reorderWorkoutExerciseSchema,
};
