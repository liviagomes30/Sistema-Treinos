const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
      maxlength: [100, "Nome deve ter no máximo 100 caracteres"],
    },
    email: {
      type: String,
      required: [true, "E-mail é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "E-mail inválido"],
    },
    password_hash: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: [6, "Senha deve ter no mínimo 6 caracteres"],
      select: false, // nunca retorna a senha nas queries
    },
    age: {
      type: Number,
      min: [10, "Idade mínima é 10 anos"],
      max: [120, "Idade máxima é 120 anos"],
    },
    avatar_url: {
      type: String,
      default: null,
    },
    reset_token: {
      type: String,
      default: null,
      select: false,
    },
    reset_token_expires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  },
);

// Hash da senha antes de salvar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Método para comparar senha no login
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

// Remove campos sensíveis ao serializar para JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.reset_token;
  delete obj.reset_token_expires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
