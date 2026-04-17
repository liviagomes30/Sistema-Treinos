const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const authController = require("../controllers/authController");
const workoutController = require("../controllers/workoutController");
const workoutExerciseController = require("../controllers/workoutExerciseController");
const exerciseCatalogController = require("../controllers/exerciseCatalogController");
const sessionController = require("../controllers/sessionController");
const logController = require("../controllers/logsController");
const aiController = require("../controllers/aiController");

// ─── AUTH (público) ────────────────────────────────────────────
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);

// ─── CATÁLOGO GLOBAL DE EXERCÍCIOS ────────────────────────────
router.get("/catalog", auth, exerciseCatalogController.getAll);
router.post("/catalog", auth, exerciseCatalogController.create);
router.get("/catalog/:id", auth, exerciseCatalogController.getOne);
router.put("/catalog/:id", auth, exerciseCatalogController.update);
router.delete("/catalog/:id", auth, exerciseCatalogController.remove);

// Histórico do usuário em um exercício do catálogo (cross-workouts)
router.get("/catalog/:catalogId/history", auth, logController.getHistory);

// ─── WORKOUTS ─────────────────────────────────────────────────
router.get("/workouts", auth, workoutController.getAll);
router.get("/workouts/:id", auth, workoutController.getOne);
router.post("/workouts", auth, workoutController.create);
router.put("/workouts/:id", auth, workoutController.update);
router.delete("/workouts/:id", auth, workoutController.remove);

// ─── WORKOUT EXERCISES (aninhado em workout) ──────────────────
// ATENÇÃO: /reorder antes de /:id para não ser capturado como parâmetro
router.patch(
  "/workouts/:workoutId/exercises/reorder",
  auth,
  workoutExerciseController.reorder,
);
router.get(
  "/workouts/:workoutId/exercises",
  auth,
  workoutExerciseController.getAll,
);
router.get(
  "/workouts/:workoutId/exercises/:id",
  auth,
  workoutExerciseController.getOne,
);
router.post(
  "/workouts/:workoutId/exercises",
  auth,
  workoutExerciseController.create,
);
router.put(
  "/workouts/:workoutId/exercises/:id",
  auth,
  workoutExerciseController.update,
);
router.delete(
  "/workouts/:workoutId/exercises/:id",
  auth,
  workoutExerciseController.remove,
);

// ─── SESSIONS ─────────────────────────────────────────────────
router.get("/sessions", auth, sessionController.getAll);
router.get("/sessions/:id", auth, sessionController.getOne);
router.post("/sessions", auth, sessionController.create);
router.put("/sessions/:id", auth, sessionController.update);
router.delete("/sessions/:id", auth, sessionController.remove);

// ─── EXERCISE LOGS (aninhado em session) ──────────────────────
router.get("/sessions/:sessionId/logs", auth, logController.getAll);
router.post("/sessions/:sessionId/logs", auth, logController.create);
router.put("/sessions/:sessionId/logs/:id", auth, logController.update);
router.delete("/sessions/:sessionId/logs/:id", auth, logController.remove);

// ─── AI ───────────────────────────────────────────────────────
router.post("/ai/analyze/:sessionId", auth, aiController.analyzeSession);
router.get("/ai/progress/:catalogId", auth, aiController.analyzeProgress);

module.exports = router;
