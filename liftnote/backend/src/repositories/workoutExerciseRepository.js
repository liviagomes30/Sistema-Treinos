const { WorkoutExercise, Workout, ExerciseCatalog, ExerciseLog } = require("../models");

class WorkoutExerciseRepository {
  async ownsWorkout(workoutId, userId) {
    return Workout.exists({ _id: workoutId, user_id: userId });
  }

  async catalogAccessible(catalogId, userId) {
    return ExerciseCatalog.exists({
      _id: catalogId,
      is_active: true,
      $or: [{ is_system: true }, { created_by_user_id: userId }],
    });
  }

  async findByWorkoutId(workoutId) {
    return WorkoutExercise.find({ workout_id: workoutId })
      .populate("exercise_catalog_id", "name muscle_group image_url")
      .sort({ order: 1 });
  }

  async findOneWithDetails(id, workoutId) {
    return WorkoutExercise.findOne({ _id: id, workout_id: workoutId }).populate(
      "exercise_catalog_id",
      "name muscle_group description instructions image_url"
    );
  }

  async findOne(id, workoutId) {
    return WorkoutExercise.findOne({ _id: id, workout_id: workoutId });
  }

  async getLastOrder(workoutId) {
    const last = await WorkoutExercise.findOne({ workout_id: workoutId }).sort({ order: -1 });
    return last ? last.order : -1;
  }

  async create(data) {
    const item = await WorkoutExercise.create(data);
    return item.populate("exercise_catalog_id", "name muscle_group image_url");
  }

  async save(document) {
    return document.save();
  }

  async populate(document) {
    return document.populate("exercise_catalog_id", "name muscle_group image_url");
  }

  async deleteOne(id, workoutId) {
    return WorkoutExercise.findOneAndDelete({ _id: id, workout_id: workoutId });
  }

  async deleteLogs(workoutExerciseId) {
    return ExerciseLog.deleteMany({ workout_exercise_id: workoutExerciseId });
  }

  async updateOrder(id, workoutId, order) {
    return WorkoutExercise.findOneAndUpdate(
      { _id: id, workout_id: workoutId },
      { order }
    );
  }
}

module.exports = new WorkoutExerciseRepository();
