const { Workout, Exercise } = require("../models");

// GET /api/workouts
const getAll = async (req, res) => {
  try {
    const workouts = await Workout.find({ user_id: req.user._id }).sort({
      created_at: -1,
    });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/workouts/:id
const getOne = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    }).populate("exercises");

    if (!workout)
      return res.status(404).json({ message: "Treino não encontrado" });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/workouts
const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workout = await Workout.create({
      user_id: req.user._id,
      name,
      description,
    });
    res.status(201).json(workout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/workouts/:id
const update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { name, description },
      { new: true, runValidators: true },
    );
    if (!workout)
      return res.status(404).json({ message: "Treino não encontrado" });
    res.json(workout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/workouts/:id
const remove = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });
    if (!workout)
      return res.status(404).json({ message: "Treino não encontrado" });

    // Remove todos os exercícios vinculados
    await Exercise.deleteMany({ workout_id: workout._id });

    res.json({ message: "Treino removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
