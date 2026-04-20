const service = require("../services/workoutService");

// GET /api/workouts
const getAll = async (req, res, next) => {
  try {
    const workouts = await service.getAll(req.user._id);
    res.json(workouts);
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts/:id
const getOne = async (req, res, next) => {
  try {
    const workout = await service.getOne(req.params.id, req.user._id);
    res.json(workout);
  } catch (err) {
    next(err);
  }
};

// POST /api/workouts
const create = async (req, res, next) => {
  try {
    const workout = await service.create(req.user._id, req.body);
    res.status(201).json(workout);
  } catch (err) {
    next(err);
  }
};

// PUT /api/workouts/:id
const update = async (req, res, next) => {
  try {
    const workout = await service.update(req.params.id, req.user._id, req.body);
    res.json(workout);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workouts/:id
const remove = async (req, res, next) => {
  try {
    const result = await service.remove(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
