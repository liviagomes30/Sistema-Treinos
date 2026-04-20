const repository = require("../repositories/workoutRepository");
const AppError = require("../utils/AppError");

class WorkoutService {
  async getAll(userId) {
    return repository.findByUserId(userId);
  }

  async getOne(id, userId) {
    const workout = await repository.findOneWithExercises(id, userId);
    if (!workout) {
      throw new AppError("Treino não encontrado", 404);
    }
    return workout;
  }

  async create(userId, data) {
    const { name, description } = data;
    return repository.create({
      user_id: userId,
      name,
      description,
    });
  }

  async update(id, userId, data) {
    const { name, description } = data;
    const workout = await repository.findOne({ _id: id, user_id: userId });
    
    if (!workout) {
      throw new AppError("Treino não encontrado", 404);
    }

    if (name !== undefined) workout.name = name;
    if (description !== undefined) workout.description = description;

    return repository.save(workout);
  }

  async remove(id, userId) {
    const workout = await repository.deleteOne({ _id: id, user_id: userId });
    
    if (!workout) {
      throw new AppError("Treino não encontrado", 404);
    }

    // Deleção em cascata
    const exerciseIds = await repository.getWorkoutExerciseIds(workout._id);
    await repository.deleteLogsByWorkoutExerciseIds(exerciseIds);
    await repository.deleteWorkoutExercises(workout._id);

    return { message: "Treino removido com sucesso" };
  }
}

module.exports = new WorkoutService();
