const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User } = require("../models");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "E-mail já cadastrado" });

    const user = await User.create({
      name,
      email,
      password_hash: password,
      age,
    });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password_hash");
    if (!user)
      return res.status(401).json({ message: "Credenciais inválidas" });

    const valid = await user.comparePassword(password);
    if (!valid)
      return res.status(401).json({ message: "Credenciais inválidas" });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select(
      "+reset_token +reset_token_expires",
    );
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });

    const token = crypto.randomBytes(32).toString("hex");
    user.reset_token = token;
    user.reset_token_expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    await user.save({ validateBeforeSave: false });

    // Em produção: enviar por e-mail. Aqui retornamos o token para fins de desenvolvimento.
    res.json({ message: "Token de redefinição gerado", reset_token: token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    const user = await User.findOne({
      reset_token: token,
      reset_token_expires: { $gt: Date.now() },
    }).select("+reset_token +reset_token_expires +password_hash");

    if (!user)
      return res.status(400).json({ message: "Token inválido ou expirado" });

    user.password_hash = new_password;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
