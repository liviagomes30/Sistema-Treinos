const { WorkoutSession, ExerciseLog, Workout } = require("../models");

class SessionRepository {
  async find(filter, skip, limit) {
    return WorkoutSession.find(filter)
      .populate("workout_id", "name description")
      .sort({ started_at: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countDocuments(filter) {
    return WorkoutSession.countDocuments(filter);
  }

  async findOneWithDetails(id, userId) {
    return WorkoutSession.findOne({ _id: id, user_id: userId })
      .populate("workout_id", "name")
      .populate({
        path: "logs",
        populate: {
          path: "workout_exercise_id",
          select: "custom_name set_type order exercise_catalog_id",
          populate: {
            path: "exercise_catalog_id",
            select: "name muscle_group",
          },
        },
      });
  }

  async findOne(id, userId) {
    return WorkoutSession.findOne({ _id: id, user_id: userId });
  }

  async create(data) {
    return WorkoutSession.create(data);
  }

  async save(document) {
    return document.save();
  }

  async deleteOne(id, userId) {
    return WorkoutSession.findOneAndDelete({ _id: id, user_id: userId });
  }

  async deleteLogsBySession(sessionId) {
    return ExerciseLog.deleteMany({ session_id: sessionId });
  }

  async checkWorkoutExists(workoutId, userId) {
    return Workout.exists({ _id: workoutId, user_id: userId });
  }

  async cancelInProgressSessions(userId) {
    return WorkoutSession.updateMany(
      { user_id: userId, status: "in_progress" },
      { status: "cancelled" }
    );
  }
}

module.exports = new SessionRepository();
