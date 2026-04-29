const mongoose = require("mongoose");
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

  async findWithLogs(filter, skip, limit) {
    const matchFilter = { ...filter };
    if (matchFilter.user_id && !(matchFilter.user_id instanceof mongoose.Types.ObjectId)) {
      matchFilter.user_id = new mongoose.Types.ObjectId(String(matchFilter.user_id));
    }

    return WorkoutSession.aggregate([
      { $match: matchFilter },
      { $sort: { started_at: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "workouts",
          localField: "workout_id",
          foreignField: "_id",
          as: "_workout",
          pipeline: [{ $project: { name: 1, description: 1 } }],
        },
      },
      { $addFields: { workout_id: { $arrayElemAt: ["$_workout", 0] } } },
      { $project: { _workout: 0 } },
      {
        $lookup: {
          from: "exerciselogs",
          localField: "_id",
          foreignField: "session_id",
          as: "logs",
          pipeline: [
            { $sort: { logged_at: 1 } },
            {
              $lookup: {
                from: "workoutexercises",
                localField: "workout_exercise_id",
                foreignField: "_id",
                as: "_we",
                pipeline: [
                  {
                    $lookup: {
                      from: "exercisecatalogs",
                      localField: "exercise_catalog_id",
                      foreignField: "_id",
                      as: "_cat",
                      pipeline: [{ $project: { name: 1, muscle_group: 1 } }],
                    },
                  },
                  {
                    $addFields: {
                      exercise_catalog_id: { $arrayElemAt: ["$_cat", 0] },
                    },
                  },
                  {
                    $project: {
                      _cat: 0,
                      custom_name: 1,
                      set_type: 1,
                      order: 1,
                      exercise_catalog_id: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                workout_exercise_id: { $arrayElemAt: ["$_we", 0] },
              },
            },
            { $project: { _we: 0 } },
          ],
        },
      },
    ]);
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
