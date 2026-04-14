const { ExerciseLog, WorkoutSession, Exercise } = require("../models");

// Verifica se a sessão pertence ao usuário
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
      .populate("exercise_id", "name muscle_group")
      .sort({ logged_at: 1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/exercises/:exerciseId/history  — histórico de um exercício específico
const getHistory = async (req, res) => {
  try {
    // Busca todos os logs do exercício agrupados por sessão
    const logs = await ExerciseLog.find({ exercise_id: req.params.exerciseId })
      .populate({
        path: "session_id",
        match: { user_id: req.user._id },
        select: "started_at status",
      })
      .sort({ logged_at: -1 })
      .limit(100);

    // Filtra apenas logs de sessões que pertencem ao usuário
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

    const { exercise_id, set_number, reps_done, weight_used_kg, notes } =
      req.body;

    // Valida que o exercício pertence ao treino da sessão
    const exercise = await Exercise.findOne({
      _id: exercise_id,
      workout_id: session.workout_id,
    });
    if (!exercise)
      return res
        .status(404)
        .json({ message: "Exercício não encontrado neste treino" });

    const log = await ExerciseLog.create({
      session_id: req.params.sessionId,
      exercise_id,
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
