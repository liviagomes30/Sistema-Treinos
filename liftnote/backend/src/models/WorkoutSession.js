const mongoose = require("mongoose");

const workoutSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Usuário é obrigatório"],
      index: true,
    },
    workout_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: [true, "Treino é obrigatório"],
      index: true,
    },
    started_at: {
      type: Date,
      default: Date.now,
    },
    ended_at: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "completed"],
        message: "Status inválido",
      },
      default: "active",
    },
    ai_summary: {
      type: String,
      default: null,
      maxlength: [2000, "Resumo da IA deve ter no máximo 2000 caracteres"],
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

workoutSessionSchema.virtual("logs", {
  ref: "ExerciseLog",
  localField: "_id",
  foreignField: "session_id",
  options: { sort: { logged_at: 1 } },
});

workoutSessionSchema.index({ user_id: 1, started_at: -1 });
workoutSessionSchema.index({ user_id: 1, workout_id: 1, started_at: -1 });

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
