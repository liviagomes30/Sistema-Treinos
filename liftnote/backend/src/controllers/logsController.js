const service = require("../services/logService");

// GET /api/sessions/:sessionId/logs
const getAll = async (req, res, next) => {
  try {
    const logs = await service.getAll(req.params.sessionId, req.user._id);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

// GET /api/catalog/:catalogId/history
const getHistory = async (req, res, next) => {
  try {
    const history = await service.getHistory(req.params.catalogId, req.user._id);
    res.json(history);
  } catch (err) {
    next(err);
  }
};

// POST /api/sessions/:sessionId/logs  — registra uma série
const create = async (req, res, next) => {
  try {
    const log = await service.create(req.params.sessionId, req.user._id, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// PUT /api/sessions/:sessionId/logs/:id
const update = async (req, res, next) => {
  try {
    const log = await service.update(req.params.id, req.params.sessionId, req.user._id, req.body);
    res.json(log);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sessions/:sessionId/logs/:id
const remove = async (req, res, next) => {
  try {
    const result = await service.remove(req.params.id, req.params.sessionId, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getHistory, create, update, remove };
