const repository = require("../repositories/workoutExerciseRepository");
const AppError = require("../utils/AppError");

class WorkoutExerciseService {
  async _checkAccess(workoutId, userId) {
    const owns = await repository.ownsWorkout(workoutId, userId);
    if (!owns) {
      throw new AppError("Acesso negado", 403);
    }
  }

  async getAll(workoutId, userId) {
    await this._checkAccess(workoutId, userId);
    return repository.findByWorkoutId(workoutId);
  }

  async getOne(id, workoutId, userId) {
    await this._checkAccess(workoutId, userId);
    const item = await repository.findOneWithDetails(id, workoutId);
    
    if (!item) {
      throw new AppError("Exercício não encontrado", 404);
    }
    return item;
  }

  async create(workoutId, userId, data) {
    await this._checkAccess(workoutId, userId);

    const { exercise_catalog_id } = data;
    const isAccessible = await repository.catalogAccessible(exercise_catalog_id, userId);
    if (!isAccessible) {
      throw new AppError("Exercício do catálogo inválido ou não acessível", 400);
    }

    const lastOrder = await repository.getLastOrder(workoutId);
    const order = lastOrder + 1;

    return repository.create({
      ...data,
      workout_id: workoutId,
      order,
    });
  }

  async update(id, workoutId, userId, data) {
    await this._checkAccess(workoutId, userId);

    const item = await repository.findOne(id, workoutId);
    if (!item) {
      throw new AppError("Exercício não encontrado", 404);
    }

    Object.assign(item, data);
    await repository.save(item);
    return repository.populate(item);
  }

  async remove(id, workoutId, userId) {
    await this._checkAccess(workoutId, userId);

    const item = await repository.deleteOne(id, workoutId);
    if (!item) {
      throw new AppError("Exercício não encontrado", 404);
    }

    // Deleção em cascata (remove logs associados)
    await repository.deleteLogs(item._id);

    return { message: "Exercício removido com sucesso" };
  }

  async reorder(workoutId, userId, updates) {
    await this._checkAccess(workoutId, userId);

    await Promise.all(
      updates.map(({ id, order }) => repository.updateOrder(id, workoutId, order))
    );

    return { message: "Ordem atualizada com sucesso" };
  }
}

module.exports = new WorkoutExerciseService();
