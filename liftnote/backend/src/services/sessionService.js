const repository = require("../repositories/sessionRepository");
const AppError = require("../utils/AppError");

class SessionService {
  async getAll(userId, query) {
    const { workout_id, limit, page } = query;
    const filter = { user_id: userId };

    if (workout_id) filter.workout_id = workout_id;

    const skip = (page - 1) * limit;

    const sessions = await repository.find(filter, skip, limit);
    const total = await repository.countDocuments(filter);

    return { data: sessions, total, page, limit };
  }

  async getOne(id, userId) {
    const session = await repository.findOneWithDetails(id, userId);
    if (!session) {
      throw new AppError("Sessão não encontrada", 404);
    }
    return session;
  }

  async create(userId, data) {
    const { workout_id } = data;

    const workoutExists = await repository.checkWorkoutExists(workout_id, userId);
    if (!workoutExists) {
      throw new AppError("Treino não encontrado", 404);
    }

    return repository.create({
      user_id: userId,
      workout_id,
    });
  }

  async update(id, userId, data) {
    const { ai_summary } = data;

    const session = await repository.findOne(id, userId);
    if (!session) {
      throw new AppError("Sessão não encontrada", 404);
    }

    if (ai_summary !== undefined) session.ai_summary = ai_summary;

    return repository.save(session);
  }

  async remove(id, userId) {
    const session = await repository.deleteOne(id, userId);
    if (!session) {
      throw new AppError("Sessão não encontrada", 404);
    }

    await repository.deleteLogsBySession(session._id);
    return { message: "Sessão removida com sucesso" };
  }
}

module.exports = new SessionService();
