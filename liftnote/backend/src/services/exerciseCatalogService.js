const repository = require("../repositories/exerciseCatalogRepository");
const AppError = require("../utils/AppError");

class ExerciseCatalogService {
  async getAll(userId, query) {
    const { muscle_group, search, include_inactive } = query;

    const filter = {
      $or: [{ is_system: true }, { created_by_user_id: userId }],
    };

    if (!include_inactive) filter.is_active = true;
    if (muscle_group) filter.muscle_group = muscle_group;
    if (search) filter.name = { $regex: search, $options: "i" };

    return repository.find(filter);
  }

  async getOne(id, userId) {
    const item = await repository.findOne({
      _id: id,
      $or: [{ is_system: true }, { created_by_user_id: userId }],
    });

    if (!item) {
      throw new AppError("Exercício não encontrado", 404);
    }
    return item;
  }

  async create(userId, data) {
    const { name, description, muscle_group, instructions, image_url } = data;

    return repository.create({
      name,
      description,
      muscle_group,
      instructions,
      image_url,
      is_system: false,
      created_by_user_id: userId,
      is_active: true,
    });
  }

  async update(id, userId, data) {
    const item = await repository.findOne({
      _id: id,
      is_system: false,
      created_by_user_id: userId,
    });

    if (!item) {
      throw new AppError("Exercício não encontrado ou não pertence ao usuário", 404);
    }

    const fields = [
      "name",
      "description",
      "muscle_group",
      "instructions",
      "image_url",
      "is_active",
    ];

    for (const f of fields) {
      if (data[f] !== undefined) item[f] = data[f];
    }

    return repository.save(item);
  }

  async remove(id, userId) {
    const item = await repository.findOne({
      _id: id,
      is_system: false,
      created_by_user_id: userId,
    });

    if (!item) {
      throw new AppError("Exercício não encontrado ou não pode ser removido", 404);
    }

    const inUse = await repository.isUsedInWorkouts(item._id);

    if (inUse) {
      item.is_active = false;
      await repository.save(item);
      return {
        message: "Exercício desativado (estava em uso em algum treino)",
        soft_deleted: true,
      };
    }

    await repository.deleteOne(item);
    return { message: "Exercício removido com sucesso" };
  }
}

module.exports = new ExerciseCatalogService();
