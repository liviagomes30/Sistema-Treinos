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
    finished_at: {
      type: Date,
      default: null,
    },
    duration_seconds: {
      type: Number,
      min: [0, "Duração não pode ser negativa"],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["in_progress", "completed", "cancelled"],
        message: "Status inválido",
      },
      default: "in_progress",
    },
    // Campo preenchido pela IA após a sessão ser concluída
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

// Virtual: calcula duração automaticamente se não foi salva explicitamente
workoutSessionSchema.virtual("duration_formatted").get(function () {
  const secs = this.duration_seconds;
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

// Virtual: logs desta sessão
workoutSessionSchema.virtual("logs", {
  ref: "ExerciseLog",
  localField: "_id",
  foreignField: "session_id",
  options: { sort: { logged_at: 1 } },
});

// Ao finalizar, calcula a duração automaticamente
workoutSessionSchema.pre("save", function (next) {
  if (this.isModified("finished_at") && this.finished_at && this.started_at) {
    this.duration_seconds = Math.round(
      (this.finished_at - this.started_at) / 1000,
    );
  }
  next();
});

// Índices para as queries mais comuns
workoutSessionSchema.index({ user_id: 1, started_at: -1 }); // histórico do usuário
workoutSessionSchema.index({ user_id: 1, workout_id: 1, started_at: -1 }); // histórico por treino
workoutSessionSchema.index({ status: 1, user_id: 1 }); // sessão em andamento

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
