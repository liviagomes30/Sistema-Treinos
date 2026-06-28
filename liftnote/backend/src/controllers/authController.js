const authService = require("../services/authService");
const emailService = require("../services/emailService");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { token } = await authService.forgotPassword(email);

    await emailService.sendPasswordResetEmail(email, token);

    res.json({
      message:
        "Se este e-mail estiver cadastrado, você receberá as instruções em breve.",
    });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.json({
        message:
          "Se este e-mail estiver cadastrado, você receberá as instruções em breve.",
      });
    }
    next(err);
  }
};

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
