const { Exercise, Workout } = require("../models");

// Verifica se o workout pertence ao usuário logado
const ownsWorkout = async (workoutId, userId) => {
  const workout = await Workout.findOne({ _id: workoutId, user_id: userId });
  return !!workout;
};

// GET /api/workouts/:workoutId/exercises
const getAll = async (req, res) => {
  try {
    if (!(await ownsWorkout(req.params.workoutId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const exercises = await Exercise.find({
      workout_id: req.params.workoutId,
    }).sort({ order: 1 });
    res.json(exercises);
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

    const exercise = await Exercise.findOne({
      _id: req.params.id,
      workout_id: req.params.workoutId,
    });
    if (!exercise)
      return res.status(404).json({ message: "Exercício não encontrado" });
    res.json(exercise);
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

    // Define a ordem como último da lista
    const lastExercise = await Exercise.findOne({
      workout_id: req.params.workoutId,
    }).sort({ order: -1 });
    const order = lastExercise ? lastExercise.order + 1 : 0;

    const exercise = await Exercise.create({
      ...req.body,
      workout_id: req.params.workoutId,
      order,
    });
    res.status(201).json(exercise);
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

    const exercise = await Exercise.findOneAndUpdate(
      { _id: req.params.id, workout_id: req.params.workoutId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!exercise)
      return res.status(404).json({ message: "Exercício não encontrado" });
    res.json(exercise);
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

    const exercise = await Exercise.findOneAndDelete({
      _id: req.params.id,
      workout_id: req.params.workoutId,
    });
    if (!exercise)
      return res.status(404).json({ message: "Exercício não encontrado" });
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

    const updates = req.body; // array de { id, order }
    await Promise.all(
      updates.map(({ id, order }) =>
        Exercise.findOneAndUpdate(
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
