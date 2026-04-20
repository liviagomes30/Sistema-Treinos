const { User } = require("../models");

class UserRepository {
  async findByEmail(email, selectFields = "") {
    return User.findOne({ email }).select(selectFields);
  }

  async findByResetToken(token) {
    return User.findOne({
      reset_token: token,
      reset_token_expires: { $gt: Date.now() },
    }).select("+reset_token +reset_token_expires +password_hash");
  }

  async create(userData) {
    return User.create(userData);
  }

  async save(userDocument, options = {}) {
    return userDocument.save(options);
  }
}

module.exports = new UserRepository();
