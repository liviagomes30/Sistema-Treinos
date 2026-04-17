const {
  ExerciseLog,
  WorkoutSession,
  WorkoutExercise,
  Workout,
} = require("../models");

const ownsSession = async (sessionId, userId) => {
  const session = await WorkoutSession.findOne({
    _id: sessionId,
    user_id: userId,
  });
  return session || null;
};

// GET /api/sessions/:sessionId/logs
const getAll = async (req, res) => {
  try {
    if (!(await ownsSession(req.params.sessionId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const logs = await ExerciseLog.find({ session_id: req.params.sessionId })
      .populate({
        path: "workout_exercise_id",
        select: "custom_name set_type order exercise_catalog_id",
        populate: {
          path: "exercise_catalog_id",
          select: "name muscle_group",
        },
      })
      .sort({ logged_at: 1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/catalog/:catalogId/history
// Histórico do usuário para um exercício do catálogo (somado entre todos os treinos)
const getHistory = async (req, res) => {
  try {
    const { catalogId } = req.params;

    const userWorkouts = await Workout.find({ user_id: req.user._id }).select(
      "_id",
    );
    const workoutIds = userWorkouts.map((w) => w._id);

    const workoutExercises = await WorkoutExercise.find({
      exercise_catalog_id: catalogId,
      workout_id: { $in: workoutIds },
    }).select("_id");

    const weIds = workoutExercises.map((we) => we._id);
    if (!weIds.length) return res.json([]);

    const logs = await ExerciseLog.find({
      workout_exercise_id: { $in: weIds },
    })
      .populate({
        path: "session_id",
        match: { user_id: req.user._id },
        select: "started_at status workout_id",
      })
      .populate({
        path: "workout_exercise_id",
        select: "custom_name workout_id",
      })
      .sort({ logged_at: -1 })
      .limit(100);

    const filtered = logs.filter((l) => l.session_id !== null);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/sessions/:sessionId/logs  — registra uma série
const create = async (req, res) => {
  try {
    const session = await ownsSession(req.params.sessionId, req.user._id);
    if (!session) return res.status(403).json({ message: "Acesso negado" });
    if (session.status !== "in_progress") {
      return res.status(400).json({ message: "Sessão não está em andamento" });
    }

    const {
      workout_exercise_id,
      set_number,
      reps_done,
      weight_used_kg,
      notes,
    } = req.body;

    const workoutExercise = await WorkoutExercise.findOne({
      _id: workout_exercise_id,
      workout_id: session.workout_id,
    });
    if (!workoutExercise)
      return res
        .status(404)
        .json({ message: "Exercício não encontrado neste treino" });

    const log = await ExerciseLog.create({
      session_id: req.params.sessionId,
      workout_exercise_id,
      set_number,
      reps_done,
      weight_used_kg,
      notes,
      logged_at: new Date(),
    });

    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/sessions/:sessionId/logs/:id
const update = async (req, res) => {
  try {
    if (!(await ownsSession(req.params.sessionId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const { reps_done, weight_used_kg, notes } = req.body;
    const log = await ExerciseLog.findOneAndUpdate(
      { _id: req.params.id, session_id: req.params.sessionId },
      { reps_done, weight_used_kg, notes },
      { new: true, runValidators: true },
    );
    if (!log)
      return res.status(404).json({ message: "Registro não encontrado" });
    res.json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/sessions/:sessionId/logs/:id
const remove = async (req, res) => {
  try {
    if (!(await ownsSession(req.params.sessionId, req.user._id))) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const log = await ExerciseLog.findOneAndDelete({
      _id: req.params.id,
      session_id: req.params.sessionId,
    });
    if (!log)
      return res.status(404).json({ message: "Registro não encontrado" });
    res.json({ message: "Registro removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getHistory, create, update, remove };
