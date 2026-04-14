const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const workoutController = require("../controllers/workoutController");
const exerciseController = require("../controllers/exerciseController");

// /api/workouts
router.get("/", auth, workoutController.getAll);
router.post("/", auth, workoutController.create);
router.get("/:id", auth, workoutController.getOne);
router.put("/:id", auth, workoutController.update);
router.delete("/:id", auth, workoutController.remove);

// /api/workouts/:workoutId/exercises
// ATENÇÃO: rota /reorder deve vir ANTES de /:id para não ser capturada como parâmetro
router.patch("/:workoutId/exercises/reorder", auth, exerciseController.reorder);
router.get("/:workoutId/exercises", auth, exerciseController.getAll);
router.post("/:workoutId/exercises", auth, exerciseController.create);
router.get("/:workoutId/exercises/:id", auth, exerciseController.getOne);
router.put("/:workoutId/exercises/:id", auth, exerciseController.update);
router.delete("/:workoutId/exercises/:id", auth, exerciseController.remove);

module.exports = router;
