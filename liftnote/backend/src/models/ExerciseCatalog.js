const mongoose = require("mongoose");
const { MUSCLE_GROUPS } = require("../constants/enums");

const exerciseCatalogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome do exercício é obrigatório"],
      trim: true,
      maxlength: [150, "Nome deve ter no máximo 150 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Descrição deve ter no máximo 500 caracteres"],
      default: null,
    },
    muscle_group: {
      type: String,
      trim: true,
      enum: {
        values: MUSCLE_GROUPS,
        message: "Grupo muscular inválido",
      },
      default: "other",
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, "Instruções devem ter no máximo 2000 caracteres"],
      default: null,
    },
    image_url: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    is_system: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  },
);

exerciseCatalogSchema.index({ name: 1 });
exerciseCatalogSchema.index({ muscle_group: 1 });
exerciseCatalogSchema.index({ is_active: 1, is_system: 1 });
exerciseCatalogSchema.index(
  { name: 1, created_by_user_id: 1 },
  {
    unique: true,
    partialFilterExpression: {
      created_by_user_id: { $type: "objectId" },
    },
  },
);

module.exports = mongoose.model("ExerciseCatalog", exerciseCatalogSchema);
