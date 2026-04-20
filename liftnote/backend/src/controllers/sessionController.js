const service = require("../services/sessionService");

// GET /api/sessions  — histórico de sessões do usuário
const getAll = async (req, res, next) => {
  try {
    const result = await service.getAll(req.user._id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/:id
const getOne = async (req, res, next) => {
  try {
    const session = await service.getOne(req.params.id, req.user._id);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

// POST /api/sessions  — inicia uma sessão
const create = async (req, res, next) => {
  try {
    const session = await service.create(req.user._id, req.body);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

// PUT /api/sessions/:id  — atualiza (ex: finaliza a sessão)
const update = async (req, res, next) => {
  try {
    const session = await service.update(req.params.id, req.user._id, req.body);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sessions/:id
const remove = async (req, res, next) => {
  try {
    const result = await service.remove(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
