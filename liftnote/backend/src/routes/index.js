const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const authController = require("../controllers/authController");
const workoutController = require("../controllers/workoutController");
const exerciseController = require("../controllers/exerciseController");
const sessionController = require("../controllers/sessionController");
const logController = require("../controllers/logsController");

// ─── AUTH (público) ────────────────────────────────────────────
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);

// ─── WORKOUTS ─────────────────────────────────────────────────
router.get("/workouts", auth, workoutController.getAll);
router.get("/workouts/:id", auth, workoutController.getOne);
router.post("/workouts", auth, workoutController.create);
router.put("/workouts/:id", auth, workoutController.update);
router.delete("/workouts/:id", auth, workoutController.remove);

// ─── EXERCISES (aninhado em workout) ──────────────────────────
router.get("/workouts/:workoutId/exercises", auth, exerciseController.getAll);
router.get(
  "/workouts/:workoutId/exercises/:id",
  auth,
  exerciseController.getOne,
);
router.post("/workouts/:workoutId/exercises", auth, exerciseController.create);
router.put(
  "/workouts/:workoutId/exercises/:id",
  auth,
  exerciseController.update,
);
router.delete(
  "/workouts/:workoutId/exercises/:id",
  auth,
  exerciseController.remove,
);
router.patch(
  "/workouts/:workoutId/exercises/reorder",
  auth,
  exerciseController.reorder,
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

// Histórico de um exercício específico (para a tela de progresso)
router.get("/exercises/:exerciseId/history", auth, logController.getHistory);

module.exports = router;
