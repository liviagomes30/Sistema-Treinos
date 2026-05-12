const repository = require("../repositories/logRepository");
const AppError = require("../utils/AppError");

class LogService {
  async _getSession(sessionId, userId) {
    const session = await repository.getSession(sessionId, userId);
    if (!session) {
      throw new AppError("Sessão não encontrada ou acesso negado", 403);
    }
    return session;
  }

  async getAll(sessionId, userId) {
    await this._getSession(sessionId, userId);
    return repository.getLogsBySessionId(sessionId);
  }

  async getHistory(catalogId, userId) {
    const workoutIds = await repository.getUserWorkoutIds(userId);
    const workoutExerciseIds = await repository.getWorkoutExerciseIdsByCatalogId(catalogId, workoutIds);
    
    if (workoutExerciseIds.length === 0) {
      return [];
    }

    return repository.getLogsHistory(workoutExerciseIds, userId);
  }

  async create(sessionId, userId, data) {
    const session = await this._getSession(sessionId, userId);

    const { workout_exercise_id, set_number, reps_done, weight_used_kg, notes } = data;

    const workoutExercise = await repository.getWorkoutExerciseInWorkout(
      workout_exercise_id,
      session.workout_id
    );

    if (!workoutExercise) {
      throw new AppError("Exercício não encontrado neste treino", 404);
    }

    return repository.create({
      session_id: sessionId,
      workout_exercise_id,
      set_number,
      reps_done,
      weight_used_kg,
      notes,
      logged_at: new Date(),
    });
  }

  async update(id, sessionId, userId, data) {
    await this._getSession(sessionId, userId);

    const log = await repository.findOneAndUpdate(id, sessionId, data);
    
    if (!log) {
      throw new AppError("Registro não encontrado", 404);
    }

    return log;
  }

  async remove(id, sessionId, userId) {
    await this._getSession(sessionId, userId);

    const log = await repository.deleteOne(id, sessionId);
    
    if (!log) {
      throw new AppError("Registro não encontrado", 404);
    }

    return { message: "Registro removido com sucesso" };
  }
}

module.exports = new LogService();
