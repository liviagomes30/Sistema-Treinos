const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Usuário é obrigatório"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Nome do treino é obrigatório"],
      trim: true,
      maxlength: [100, "Nome deve ter no máximo 100 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Descrição deve ter no máximo 500 caracteres"],
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

workoutSchema.virtual("workout_exercises", {
  ref: "WorkoutExercise",
  localField: "_id",
  foreignField: "workout_id",
  options: { sort: { order: 1 } },
});

workoutSchema.index({ user_id: 1, name: 1 });

module.exports = mongoose.model("Workout", workoutSchema);
