const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório").max(100),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    age: z.number().min(10, "Idade mínima é 10 anos").max(120, "Idade máxima é 120 anos").optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    password: z.string().min(1, "A senha é obrigatória"),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token é obrigatório"),
    new_password: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
