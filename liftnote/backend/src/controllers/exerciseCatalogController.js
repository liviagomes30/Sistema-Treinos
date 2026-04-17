const { ExerciseCatalog, WorkoutExercise } = require("../models");

// GET /api/catalog
// Retorna exercícios do sistema + os criados pelo próprio usuário
const getAll = async (req, res) => {
  try {
    const { muscle_group, search, include_inactive } = req.query;

    const filter = {
      $or: [{ is_system: true }, { created_by_user_id: req.user._id }],
    };

    if (!include_inactive) filter.is_active = true;
    if (muscle_group) filter.muscle_group = muscle_group;
    if (search) filter.name = { $regex: search, $options: "i" };

    const items = await ExerciseCatalog.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/catalog/:id
const getOne = async (req, res) => {
  try {
    const item = await ExerciseCatalog.findOne({
      _id: req.params.id,
      $or: [{ is_system: true }, { created_by_user_id: req.user._id }],
    });
    if (!item)
      return res.status(404).json({ message: "Exercício não encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/catalog
// Usuário cria exercício customizado (is_system=false, created_by_user_id=user)
const create = async (req, res) => {
  try {
    const { name, description, muscle_group, instructions, image_url } =
      req.body;

    const item = await ExerciseCatalog.create({
      name,
      description,
      muscle_group,
      instructions,
      image_url,
      is_system: false,
      created_by_user_id: req.user._id,
      is_active: true,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/catalog/:id
// Apenas exercícios do próprio usuário podem ser editados (sistema é imutável)
const update = async (req, res) => {
  try {
    const item = await ExerciseCatalog.findOne({
      _id: req.params.id,
      is_system: false,
      created_by_user_id: req.user._id,
    });
    if (!item)
      return res.status(404).json({
        message: "Exercício não encontrado ou não pertence ao usuário",
      });

    const fields = [
      "name",
      "description",
      "muscle_group",
      "instructions",
      "image_url",
      "is_active",
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/catalog/:id
// Só remove customizados do próprio usuário. Se estiver em uso, faz soft-delete (is_active=false).
const remove = async (req, res) => {
  try {
    const item = await ExerciseCatalog.findOne({
      _id: req.params.id,
      is_system: false,
      created_by_user_id: req.user._id,
    });
    if (!item)
      return res.status(404).json({
        message: "Exercício não encontrado ou não pode ser removido",
      });

    const inUse = await WorkoutExercise.exists({
      exercise_catalog_id: item._id,
    });

    if (inUse) {
      item.is_active = false;
      await item.save();
      return res.json({
        message: "Exercício desativado (estava em uso em algum treino)",
        soft_deleted: true,
      });
    }

    await item.deleteOne();
    res.json({ message: "Exercício removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
