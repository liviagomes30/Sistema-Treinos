const { z } = require("zod");
const { MUSCLE_GROUPS } = require("../constants/enums");

const getCatalogSchema = z.object({
  query: z.object({
    muscle_group: z.enum(MUSCLE_GROUPS).optional(),
    search: z.string().optional(),
    include_inactive: z.string().optional().transform((val) => val === "true"),
  }),
});

const createCatalogSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório").max(150, "Máximo de 150 caracteres"),
    description: z.string().max(500, "Máximo de 500 caracteres").optional().nullable(),
    muscle_group: z.enum(MUSCLE_GROUPS).optional().default("other"),
    instructions: z.string().max(2000, "Máximo de 2000 caracteres").optional().nullable(),
    image_url: z.string().url("URL de imagem inválida").optional().nullable(),
  }),
});

const updateCatalogSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    description: z.string().max(500).optional().nullable(),
    muscle_group: z.enum(MUSCLE_GROUPS).optional(),
    instructions: z.string().max(2000).optional().nullable(),
    image_url: z.string().url("URL de imagem inválida").optional().nullable(),
    is_active: z.boolean().optional(),
  }),
});

module.exports = {
  getCatalogSchema,
  createCatalogSchema,
  updateCatalogSchema,
};
