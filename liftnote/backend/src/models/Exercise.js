const mongoose = require("mongoose");

// Sub-schema para configuração de pirâmide
// Ex: 4 séries com pesos/reps diferentes por série
const pyramidSetSchema = new mongoose.Schema(
  {
    set_number: { type: Number, required: true },
    reps: { type: Number, required: true, min: 1 },
    weight_kg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const exerciseSchema = new mongoose.Schema(
  {
    workout_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: [true, "Treino é obrigatório"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Nome do exercício é obrigatório"],
      trim: true,
      maxlength: [150, "Nome deve ter no máximo 150 caracteres"],
    },
    muscle_group: {
      type: String,
      trim: true,
      enum: {
        values: [
          "chest",
          "back",
          "shoulders",
          "biceps",
          "triceps",
          "forearms",
          "abs",
          "glutes",
          "quadriceps",
          "hamstrings",
          "calves",
          "full_body",
          "other",
        ],
        message: "Grupo muscular inválido",
      },
      default: "other",
    },
    set_type: {
      type: String,
      enum: {
        values: ["linear", "pyramid"],
        message: "Tipo de série deve ser linear ou pyramid",
      },
      default: "linear",
    },

    // Campos para série LINEAR (mesmo peso/reps em todas as séries)
    series: {
      type: Number,
      min: [1, "Mínimo 1 série"],
      max: [20, "Máximo 20 séries"],
    },
    reps: {
      type: Number,
      min: [1, "Mínimo 1 repetição"],
    },
    weight_kg: {
      type: Number,
      min: [0, "Peso não pode ser negativo"],
      default: 0,
    },

    // Campos para série PIRÂMIDE (peso/reps por série)
    pyramid_sets: {
      type: [pyramidSetSchema],
      default: [],
    },

    rest_seconds: {
      type: Number,
      min: [0, "Descanso não pode ser negativo"],
      default: 120, // 2 minutos padrão
    },
    no_rest: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Observações devem ter no máximo 500 caracteres"],
      default: null,
    },
    order: {
      type: Number,
      default: 0, // posição do exercício dentro do treino
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  },
);

// Validação: pirâmide exige pyramid_sets preenchido
exerciseSchema.pre("save", function (next) {
  if (
    this.set_type === "pyramid" &&
    (!this.pyramid_sets || this.pyramid_sets.length === 0)
  ) {
    return next(
      new Error("Série pirâmide exige ao menos uma configuração de série"),
    );
  }
  if (this.set_type === "linear" && (!this.series || !this.reps)) {
    return next(new Error("Série linear exige número de séries e repetições"));
  }
  next();
});

exerciseSchema.index({ workout_id: 1, order: 1 });

module.exports = mongoose.model("Exercise", exerciseSchema);
