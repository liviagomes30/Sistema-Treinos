const { Workout, WorkoutExercise, ExerciseLog } = require("../models");

class WorkoutRepository {
  async findByUserId(userId) {
    return Workout.find({ user_id: userId }).sort({ created_at: -1 });
  }

  async findOneWithExercises(id, userId) {
    return Workout.findOne({ _id: id, user_id: userId }).populate({
      path: "workout_exercises",
      populate: {
        path: "exercise_catalog_id",
        select: "name muscle_group image_url",
      },
    });
  }

  async findOne(filter) {
    return Workout.findOne(filter);
  }

  async create(data) {
    return Workout.create(data);
  }

  async save(document) {
    return document.save();
  }

  async deleteOne(filter) {
    return Workout.findOneAndDelete(filter);
  }

  // Cascading deletes
  async getWorkoutExerciseIds(workoutId) {
    const exercises = await WorkoutExercise.find({ workout_id: workoutId }).select("_id");
    return exercises.map((we) => we._id);
  }

  async deleteLogsByWorkoutExerciseIds(ids) {
    if (ids.length === 0) return;
    return ExerciseLog.deleteMany({ workout_exercise_id: { $in: ids } });
  }

  async deleteWorkoutExercises(workoutId) {
    return WorkoutExercise.deleteMany({ workout_id: workoutId });
  }
}

module.exports = new WorkoutRepository();
