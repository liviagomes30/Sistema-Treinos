const { ExerciseCatalog, WorkoutExercise } = require("../models");

class ExerciseCatalogRepository {
  async find(filter, sort = { name: 1 }) {
    return ExerciseCatalog.find(filter).sort(sort);
  }

  async findOne(filter) {
    return ExerciseCatalog.findOne(filter);
  }

  async create(data) {
    return ExerciseCatalog.create(data);
  }

  async save(document) {
    return document.save();
  }

  async deleteOne(document) {
    return document.deleteOne();
  }

  async isUsedInWorkouts(exerciseCatalogId) {
    return WorkoutExercise.exists({ exercise_catalog_id: exerciseCatalogId });
  }
}

module.exports = new ExerciseCatalogRepository();
