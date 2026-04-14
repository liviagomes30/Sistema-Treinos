const { WorkoutSession, ExerciseLog, Workout } = require("../models");

// GET /api/sessions  — histórico de sessões do usuário
const getAll = async (req, res) => {
  try {
    const { workout_id, status, limit = 20, page = 1 } = req.query;
    const filter = { user_id: req.user._id };
    if (workout_id) filter.workout_id = workout_id;
    if (status) filter.status = status;

    const sessions = await WorkoutSession.find(filter)
      .populate("workout_id", "name description")
      .sort({ started_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await WorkoutSession.countDocuments(filter);

    res.json({
      data: sessions,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/sessions/:id
const getOne = async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    })
      .populate("workout_id", "name")
      .populate({
        path: "logs",
        populate: { path: "exercise_id", select: "name muscle_group" },
      });

    if (!session)
      return res.status(404).json({ message: "Sessão não encontrada" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/sessions  — inicia uma sessão
const create = async (req, res) => {
  try {
    const { workout_id } = req.body;

    const workout = await Workout.findOne({
      _id: workout_id,
      user_id: req.user._id,
    });
    if (!workout)
      return res.status(404).json({ message: "Treino não encontrado" });

    // Cancela qualquer sessão em andamento do mesmo usuário
    await WorkoutSession.updateMany(
      { user_id: req.user._id, status: "in_progress" },
      { status: "cancelled" },
    );

    const session = await WorkoutSession.create({
      user_id: req.user._id,
      workout_id,
      started_at: new Date(),
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/sessions/:id  — atualiza (ex: finaliza a sessão)
const update = async (req, res) => {
  try {
    const { status, ai_summary } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (ai_summary) updateData.ai_summary = ai_summary;

    if (status === "completed") {
      updateData.finished_at = new Date();
    }

    const session = await WorkoutSession.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      updateData,
      { new: true, runValidators: true },
    );
    if (!session)
      return res.status(404).json({ message: "Sessão não encontrada" });
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/sessions/:id
const remove = async (req, res) => {
  try {
    const session = await WorkoutSession.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });
    if (!session)
      return res.status(404).json({ message: "Sessão não encontrada" });

    await ExerciseLog.deleteMany({ session_id: session._id });
    res.json({ message: "Sessão removida com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
