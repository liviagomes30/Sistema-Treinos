const mongoose = require("mongoose");

const exerciseLogSchema = new mongoose.Schema(
  {
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutSession",
      required: [true, "Sessão é obrigatória"],
      index: true,
    },
    exercise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: [true, "Exercício é obrigatório"],
      index: true,
    },
    set_number: {
      type: Number,
      required: [true, "Número da série é obrigatório"],
      min: [1, "Número da série mínimo é 1"],
    },
    reps_done: {
      type: Number,
      required: [true, "Repetições realizadas são obrigatórias"],
      min: [0, "Repetições não podem ser negativas"],
    },
    weight_used_kg: {
      type: Number,
      required: [true, "Peso utilizado é obrigatório"],
      min: [0, "Peso não pode ser negativo"],
      default: 0,
    },
    logged_at: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Observações devem ter no máximo 300 caracteres"],
      default: null,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: volume total desta série (peso × reps)
exerciseLogSchema.virtual("volume").get(function () {
  return parseFloat((this.weight_used_kg * this.reps_done).toFixed(2));
});

// Índices para histórico e análise de progresso
exerciseLogSchema.index({ session_id: 1, set_number: 1 });
exerciseLogSchema.index({ exercise_id: 1, logged_at: -1 }); // histórico por exercício (tela de progresso)
exerciseLogSchema.index({ session_id: 1, exercise_id: 1 });

module.exports = mongoose.model("ExerciseLog", exerciseLogSchema);
