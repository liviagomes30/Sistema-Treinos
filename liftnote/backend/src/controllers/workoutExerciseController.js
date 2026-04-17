const {
  WorkoutExercise,
  Workout,
  ExerciseCatalog,
  ExerciseLog,
} = require("../models");

const ownsWorkout = async (workoutId, userId) => {
  const workout = await Workout.findOne({ _id: workoutId, user_id: userId });
  return !!workout;
};

// Verifica se o exercício do catálogo está acessível ao usuário
const catalogAccessible = async (catalogId, userId) => {
  const item = await ExerciseCatalog.findOne({
    _id: catalogId,
    is_active: true,
    $or: [{ is_system: true }, { created_by_user_id: userId }],
  });
  return !!item;
};

// GET /api/workouts/:workoutId/exercises
const getAll = async (req, res) => {
  try {
    if (!(await ownsWorkout(req.params.workoutId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const items = await WorkoutExercise.find({
      workout_id: req.params.workoutId,
    })
      .populate("exercise_catalog_id", "name muscle_group image_url")
      .sort({ order: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/workouts/:workoutId/exercises/:id
const getOne = async (req, res) => {
  try {
    if (!(await ownsWorkout(req.params.workoutId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const item = await WorkoutExercise.findOne({
      _id: req.params.id,
      workout_id: req.params.workoutId,
    }).populate(
      "exercise_catalog_id",
      "name muscle_group description instructions image_url",
    );

    if (!item)
      return res.status(404).json({ message: "Exercício não encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/workouts/:workoutId/exercises
const create = async (req, res) => {
  try {
    if (!(await ownsWorkout(req.params.workoutId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const { exercise_catalog_id } = req.body;
    if (!exercise_catalog_id) {
      return res
        .status(400)
        .json({ message: "exercise_catalog_id é obrigatório" });
    }

    if (!(await catalogAccessible(exercise_catalog_id, req.user._id))) {
      return res.status(400).json({
        message: "Exercício do catálogo inválido ou não acessível",
      });
    }

    const last = await WorkoutExercise.findOne({
      workout_id: req.params.workoutId,
    }).sort({ order: -1 });
    const order = last ? last.order + 1 : 0;

    const item = await WorkoutExercise.create({
      ...req.body,
      workout_id: req.params.workoutId,
      order,
    });

    await item.populate("exercise_catalog_id", "name muscle_group image_url");
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/workouts/:workoutId/exercises/:id
const update = async (req, res) => {
  try {
    if (!(await ownsWorkout(req.params.workoutId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (req.body.exercise_catalog_id) {
      if (!(await catalogAccessible(req.body.exercise_catalog_id, req.user._id))) {
        return res.status(400).json({
          message: "Exercício do catálogo inválido ou não acessível",
        });
      }
    }

    const item = await WorkoutExercise.findOne({
      _id: req.params.id,
      workout_id: req.params.workoutId,
    });
    if (!item)
      return res.status(404).json({ message: "Exercício não encontrado" });

    Object.assign(item, req.body);
    await item.save();
    await item.populate("exercise_catalog_id", "name muscle_group image_url");

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/workouts/:workoutId/exercises/:id
const remove = async (req, res) => {
  try {
    if (!(await ownsWorkout(req.params.workoutId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const item = await WorkoutExercise.findOneAndDelete({
      _id: req.params.id,
      workout_id: req.params.workoutId,
    });
    if (!item)
      return res.status(404).json({ message: "Exercício não encontrado" });

    await ExerciseLog.deleteMany({ workout_exercise_id: item._id });

    res.json({ message: "Exercício removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/workouts/:workoutId/exercises/reorder
// Body: [{ id, order }, ...]
const reorder = async (req, res) => {
  try {
    if (!(await ownsWorkout(req.params.workoutId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const updates = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Corpo deve ser um array" });
    }

    await Promise.all(
      updates.map(({ id, order }) =>
        WorkoutExercise.findOneAndUpdate(
          { _id: id, workout_id: req.params.workoutId },
          { order },
        ),
      ),
    );
    res.json({ message: "Ordem atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, reorder };
