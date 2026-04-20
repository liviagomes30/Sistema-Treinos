require("dotenv").config();
const mongoose = require("mongoose");
const { ExerciseCatalog } = require("../models");
const exercises = require("../data/exercises-ptbr-full-translation.json");

const MUSCLE_GROUP_MAP = {
  "peito":               "chest",
  "dorsais":             "back",
  "meio-das-costas":     "back",
  "inferior-das-costas": "back",
  "ombros":              "shoulders",
  "trapezio":            "traps",
  "pescoco":             "neck",
  "biceps":              "biceps",
  "triceps":             "triceps",
  "antebracos":          "forearms",
  "abdominais":          "abs",
  "gluteos":             "glutes",
  "abdutores":           "abductors",
  "adutores":            "adductors",
  "quadriceps":          "quadriceps",
  "isquiotibiais":       "hamstrings",
  "panturrilhas":        "calves",
};

function buildDescription(exercise) {
  const parts = [
    exercise.category  && `Categoria: ${exercise.category}`,
    exercise.level     && `Nível: ${exercise.level}`,
    exercise.equipment && `Equipamento: ${exercise.equipment}`,
    exercise.mechanic  && `Mecânica: ${exercise.mechanic}`,
    exercise.force     && `Força: ${exercise.force}`,
    exercise.secondaryMuscles?.length > 0
      && `Músculos secundários: ${exercise.secondaryMuscles.join(", ")}`,
  ].filter(Boolean);

  return parts.join(" | ") || null;
}

function mapExercise(exercise) {
  // Garantir que os nomes tenham limite de 150 caracteres para respeitar o Schema
  const name = exercise.name.length > 150 ? exercise.name.substring(0, 147) + "..." : exercise.name;
  
  // Garantir que a descrição não exceda os 500 caracteres
  let description = buildDescription(exercise);
  if (description && description.length > 500) {
    description = description.substring(0, 497) + "...";
  }

  // Garantir que as instruções não excedam 2000 caracteres
  let instructions = exercise.instructions.join("\n") || null;
  if (instructions && instructions.length > 2000) {
    instructions = instructions.substring(0, 1997) + "...";
  }

  return {
    name,
    description,
    muscle_group:       MUSCLE_GROUP_MAP[exercise.primaryMuscles[0]] ?? "other",
    instructions,
    image_url:          exercise.images?.[0] ?? null,
    is_active:          true,
    is_system:          true,
    created_by_user_id: null,
  };
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado ao MongoDB.");

  const existing = await ExerciseCatalog.countDocuments({ is_system: true });
  if (existing > 0) {
    console.log(`Seed já executado (${existing} exercícios encontrados). Encerrando.`);
    await mongoose.disconnect();
    return;
  }

  const mapped = exercises.map(mapExercise);

  const result = await ExerciseCatalog.insertMany(mapped, {
    ordered:   false,
    rawResult: true,
  });

  console.log(`Inseridos: ${result.insertedCount} de ${mapped.length} exercícios.`);
  await mongoose.disconnect();
  console.log("Concluído.");
}

seed().catch((err) => {
  console.error("Erro no seed:", err.message);
  process.exit(1);
});
