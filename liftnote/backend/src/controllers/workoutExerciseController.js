const service = require("../services/workoutExerciseService");
const logRepository = require("../repositories/logRepository");

const getAll = async (req, res, next) => {
  try {
    const items = await service.getAll(req.params.workoutId, req.user._id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const item = await service.getOne(req.params.id, req.params.workoutId, req.user._id);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const item = await service.create(req.params.workoutId, req.user._id, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.params.workoutId, req.user._id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await service.remove(req.params.id, req.params.workoutId, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const reorder = async (req, res, next) => {
  try {
    const result = await service.reorder(req.params.workoutId, req.user._id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

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
