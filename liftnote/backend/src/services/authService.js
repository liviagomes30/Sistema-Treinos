const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/AppError");

class AuthService {
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  }

  async register(data) {
    const { name, email, password, age } = data;

    const exists = await userRepository.findByEmail(email);
    if (exists) {
      throw new AppError("E-mail já cadastrado", 409);
    }

    const user = await userRepository.create({
      name,
      email,
      password_hash: password,
      age,
    });

    const token = this.generateToken(user._id);
    return { token, user };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email, "+password_hash");
    
    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const token = this.generateToken(user._id);
    return { token, user };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email, "+reset_token +reset_token_expires");
    
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.reset_token = token;
    user.reset_token_expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    
    await userRepository.save(user, { validateBeforeSave: false });

    return { token };
  }

  async resetPassword(token, new_password) {
    const user = await userRepository.findByResetToken(token);

    if (!user) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    user.password_hash = new_password;
    user.reset_token = null;
    user.reset_token_expires = null;
    
    await userRepository.save(user);
  }
}

module.exports = new AuthService();
