const authService = require("../services/authService");

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { token } = await authService.forgotPassword(email);

    // Em produção: enviar por e-mail. Em desenvolvimento, retorna o token na resposta.
    const response = { message: "Token de redefinição gerado" };
    if (process.env.NODE_ENV !== "production") {
      response.reset_token = token;
    }
    
    res.json(response);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;
    await authService.resetPassword(token, new_password);
    res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
