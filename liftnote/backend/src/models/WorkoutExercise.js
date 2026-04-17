const mongoose = require("mongoose");
const { SET_TYPES } = require("../constants/enums");

const pyramidSetSchema = new mongoose.Schema(
  {
    set_number: { type: Number, required: true, min: 1 },
    reps: { type: Number, required: true, min: 1 },
    weight_kg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const workoutExerciseSchema = new mongoose.Schema(
  {
    workout_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: [true, "Treino é obrigatório"],
      index: true,
    },
    exercise_catalog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExerciseCatalog",
      required: [true, "Exercício do catálogo é obrigatório"],
      index: true,
    },
    custom_name: {
      type: String,
      trim: true,
      maxlength: [150, "Nome customizado deve ter no máximo 150 caracteres"],
      default: null,
    },
    set_type: {
      type: String,
      enum: {
        values: SET_TYPES,
        message: "Tipo de série deve ser linear ou pyramid",
      },
      default: "linear",
    },

    series: {
      type: Number,
      min: [1, "Mínimo 1 série"],
      max: [20, "Máximo 20 séries"],
      default: null,
    },
    reps: {
      type: Number,
      min: [1, "Mínimo 1 repetição"],
      default: null,
    },
    weight_kg: {
      type: Number,
      min: [0, "Peso não pode ser negativo"],
      default: 0,
    },

    pyramid_sets: {
      type: [pyramidSetSchema],
      default: [],
    },

    rest_seconds: {
      type: Number,
      min: [0, "Descanso não pode ser negativo"],
      default: 120,
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
      default: 0,
    },
    is_optional: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

workoutExerciseSchema.pre("save", function (next) {
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

workoutExerciseSchema.virtual("display_name").get(function () {
  return this.custom_name || null;
});

workoutExerciseSchema.index({ workout_id: 1, order: 1 });
workoutExerciseSchema.index({ workout_id: 1, exercise_catalog_id: 1 });

module.exports = mongoose.model("WorkoutExercise", workoutExerciseSchema);
