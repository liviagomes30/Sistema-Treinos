const {
  ExerciseLog,
  WorkoutSession,
  WorkoutExercise,
  Workout,
} = require("../models");

class LogRepository {
  async getSession(sessionId, userId) {
    return WorkoutSession.findOne({ _id: sessionId, user_id: userId });
  }

  async getLogsBySessionId(sessionId) {
    return ExerciseLog.find({ session_id: sessionId })
      .populate({
        path: "workout_exercise_id",
        select: "custom_name set_type order exercise_catalog_id",
        populate: {
          path: "exercise_catalog_id",
          select: "name muscle_group",
        },
      })
      .sort({ logged_at: 1 });
  }

  async getUserWorkoutIds(userId) {
    const userWorkouts = await Workout.find({ user_id: userId }).select("_id");
    return userWorkouts.map((w) => w._id);
  }

  async getWorkoutExerciseIdsByCatalogId(catalogId, workoutIds) {
    const workoutExercises = await WorkoutExercise.find({
      exercise_catalog_id: catalogId,
      workout_id: { $in: workoutIds },
    }).select("_id");
    return workoutExercises.map((we) => we._id);
  }

  async getLogsHistory(workoutExerciseIds, userId) {
    const logs = await ExerciseLog.find({
      workout_exercise_id: { $in: workoutExerciseIds },
    })
      .populate({
        path: "session_id",
        match: { user_id: userId },
        select: "started_at status workout_id",
      })
      .populate({
        path: "workout_exercise_id",
        select: "custom_name workout_id",
      })
      .sort({ logged_at: -1 })
      .limit(100);

    // Mongoose popula com null quando o match falha. Vamos filtrar.
    return logs.filter((l) => l.session_id !== null);
  }

  async getWorkoutExerciseInWorkout(workoutExerciseId, workoutId) {
    return WorkoutExercise.findOne({
      _id: workoutExerciseId,
      workout_id: workoutId,
    });
  }

  async create(data) {
    return ExerciseLog.create(data);
  }

  async findOneAndUpdate(id, sessionId, data) {
    return ExerciseLog.findOneAndUpdate(
      { _id: id, session_id: sessionId },
      data,
      { new: true, runValidators: true }
    );
  }

  async deleteOne(id, sessionId) {
    return ExerciseLog.findOneAndDelete({ _id: id, session_id: sessionId });
  }
}

module.exports = new LogRepository();
