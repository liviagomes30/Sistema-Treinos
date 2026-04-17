const mongoose = require("mongoose");

const exerciseLogSchema = new mongoose.Schema(
  {
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutSession",
      required: [true, "Sessão é obrigatória"],
      index: true,
    },
    workout_exercise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutExercise",
      required: [true, "Exercício do treino é obrigatório"],
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

exerciseLogSchema.virtual("volume").get(function () {
  return parseFloat((this.weight_used_kg * this.reps_done).toFixed(2));
});

exerciseLogSchema.index({ session_id: 1, set_number: 1 });
exerciseLogSchema.index({ workout_exercise_id: 1, logged_at: -1 });
exerciseLogSchema.index({ session_id: 1, workout_exercise_id: 1 });

module.exports = mongoose.model("ExerciseLog", exerciseLogSchema);
