const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/AppError");

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me — atualiza nome, email, idade
const updateMe = async (req, res, next) => {
  try {
    const { name, email, age } = req.body;
    const user = req.user;

    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Verifica se o e-mail já está em uso por outro usuário
      if (email !== user.email) {
        const existing = await userRepository.findByEmail(email);
        if (existing && existing._id.toString() !== user._id.toString()) {
          throw new AppError("E-mail já está em uso", 409);
        }
        user.email = email;
      }
    }
    if (age !== undefined) user.age = age;

    await userRepository.save(user);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me/password — altera a senha
const updatePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      throw new AppError("Informe a senha atual e a nova senha", 400);
    }
    if (new_password.length < 6) {
      throw new AppError("A nova senha deve ter pelo menos 6 caracteres", 400);
    }

    // Busca o usuário com o hash da senha (normalmente excluído do select)
    const userWithPwd = await userRepository.findByEmail(
      req.user.email,
      "+password_hash",
    );
    if (!userWithPwd) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const valid = await userWithPwd.comparePassword(current_password);
    if (!valid) {
      throw new AppError("Senha atual incorreta", 401);
    }

    userWithPwd.password_hash = new_password;
    await userRepository.save(userWithPwd);

    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me — exclui a conta
const deleteMe = async (req, res, next) => {
  try {
    await userRepository.deleteById(req.user._id);
    res.json({ message: "Conta excluída com sucesso" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, updatePassword, deleteMe };
