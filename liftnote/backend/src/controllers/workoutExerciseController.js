const service = require("../services/workoutExerciseService");
const logRepository = require("../repositories/logRepository");

// GET /api/workouts/:workoutId/exercises
const getAll = async (req, res, next) => {
  console.log('type of next:', typeof next); try {
    const items = await service.getAll(req.params.workoutId, req.user._id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts/:workoutId/exercises/:id
const getOne = async (req, res, next) => {
  try {
    const item = await service.getOne(req.params.id, req.params.workoutId, req.user._id);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// POST /api/workouts/:workoutId/exercises
const create = async (req, res, next) => {
  try {
    const item = await service.create(req.params.workoutId, req.user._id, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/workouts/:workoutId/exercises/:id
const update = async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.params.workoutId, req.user._id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workouts/:workoutId/exercises/:id
const remove = async (req, res, next) => {
  try {
    const result = await service.remove(req.params.id, req.params.workoutId, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/workouts/:workoutId/exercises/reorder
const reorder = async (req, res, next) => {
  try {
    const result = await service.reorder(req.params.workoutId, req.user._id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts/:workoutId/last-loads
const getLastLoads = async (req, res, next) => {
  try {
    const loads = await logRepository.getLastLoadsByWorkout(
      req.params.workoutId,
      req.user._id,
    );
    res.json(loads);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove, reorder, getLastLoads };
