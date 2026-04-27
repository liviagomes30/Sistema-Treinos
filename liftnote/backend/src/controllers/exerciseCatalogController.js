const service = require("../services/exerciseCatalogService");

// GET /api/catalog
const getAll = async (req, res, next) => {
  try {
    const items = await service.getAll(req.user._id, req.query);
    res.json(items);
  } catch (err) {
    console.error('[exerciseCatalog] getAll error:', err);
    next(err);
  }
};

// GET /api/catalog/:id
const getOne = async (req, res, next) => {
  try {
    const item = await service.getOne(req.params.id, req.user._id);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// POST /api/catalog
const create = async (req, res, next) => {
  try {
    const item = await service.create(req.user._id, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/catalog/:id
const update = async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.user._id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/catalog/:id
const remove = async (req, res, next) => {
  try {
    const result = await service.remove(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
