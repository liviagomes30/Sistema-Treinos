const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const rateLimiter = require("../middlewares/rateLimiter");
const validateRequest = require("../middlewares/validateRequest");
const authSchemas = require("../validators/authSchemas");

const authController = require("../controllers/authController");
const workoutController = require("../controllers/workoutController");
const workoutExerciseController = require("../controllers/workoutExerciseController");
const exerciseCatalogController = require("../controllers/exerciseCatalogController");
const sessionController = require("../controllers/sessionController");
const logController = require("../controllers/logsController");
const aiController = require("../controllers/aiController");

// ─── AUTH (público) ────────────────────────────────────────────
// Aplicado o rate limiter e validação Zod apenas nas rotas sensíveis de auth
router.post(
  "/auth/register",
  rateLimiter,
  validateRequest(authSchemas.registerSchema),
  authController.register
);
router.post(
  "/auth/login",
  rateLimiter,
  validateRequest(authSchemas.loginSchema),
  authController.login
);
router.post(
  "/auth/forgot-password",
  rateLimiter,
  validateRequest(authSchemas.forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/auth/reset-password",
  rateLimiter,
  validateRequest(authSchemas.resetPasswordSchema),
  authController.resetPassword
);

const catalogSchemas = require("../validators/exerciseCatalogSchemas");

// ─── CATÁLOGO GLOBAL DE EXERCÍCIOS ────────────────────────────
router.get(
  "/catalog",
  auth,
  validateRequest(catalogSchemas.getCatalogSchema),
  exerciseCatalogController.getAll
);
router.post(
  "/catalog",
  auth,
  validateRequest(catalogSchemas.createCatalogSchema),
  exerciseCatalogController.create
);
router.get("/catalog/:id", auth, exerciseCatalogController.getOne);
router.put(
  "/catalog/:id",
  auth,
  validateRequest(catalogSchemas.updateCatalogSchema),
  exerciseCatalogController.update
);
router.delete("/catalog/:id", auth, exerciseCatalogController.remove);

// Histórico do usuário em um exercício do catálogo (cross-workouts)
router.get("/catalog/:catalogId/history", auth, logController.getHistory);

const workoutSchemas = require("../validators/workoutSchemas");
const workoutExerciseSchemas = require("../validators/workoutExerciseSchemas");
const sessionSchemas = require("../validators/sessionSchemas");
const logSchemas = require("../validators/logSchemas");

// ─── WORKOUTS ─────────────────────────────────────────────────
router.get("/workouts", auth, workoutController.getAll);
router.get("/workouts/:id", auth, workoutController.getOne);
router.post("/workouts", auth, validateRequest(workoutSchemas.createWorkoutSchema), workoutController.create);
router.put("/workouts/:id", auth, validateRequest(workoutSchemas.updateWorkoutSchema), workoutController.update);
router.delete("/workouts/:id", auth, workoutController.remove);

// ─── WORKOUT EXERCISES (aninhado em workout) ──────────────────
router.patch(
  "/workouts/:workoutId/exercises/reorder",
  auth,
  validateRequest(workoutExerciseSchemas.reorderWorkoutExerciseSchema),
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
  validateRequest(workoutExerciseSchemas.createWorkoutExerciseSchema),
  workoutExerciseController.create,
);
router.put(
  "/workouts/:workoutId/exercises/:id",
  auth,
  validateRequest(workoutExerciseSchemas.updateWorkoutExerciseSchema),
  workoutExerciseController.update,
);
router.delete(
  "/workouts/:workoutId/exercises/:id",
  auth,
  workoutExerciseController.remove,
);

// ─── SESSIONS ─────────────────────────────────────────────────
router.get("/sessions", auth, validateRequest(sessionSchemas.getSessionsSchema), sessionController.getAll);
router.get("/sessions/:id", auth, sessionController.getOne);
router.post("/sessions", auth, validateRequest(sessionSchemas.createSessionSchema), sessionController.create);
router.put("/sessions/:id", auth, validateRequest(sessionSchemas.updateSessionSchema), sessionController.update);
router.delete("/sessions/:id", auth, sessionController.remove);

// ─── EXERCISE LOGS (aninhado em session) ──────────────────────
router.get("/sessions/:sessionId/logs", auth, logController.getAll);
router.post("/sessions/:sessionId/logs", auth, validateRequest(logSchemas.createLogSchema), logController.create);
router.put("/sessions/:sessionId/logs/:id", auth, validateRequest(logSchemas.updateLogSchema), logController.update);
router.delete("/sessions/:sessionId/logs/:id", auth, logController.remove);

const aiSchemas = require("../validators/aiSchemas");

// ─── AI ───────────────────────────────────────────────────────
router.post(
  "/ai/analyze/:sessionId",
  auth,
  validateRequest(aiSchemas.analyzeSessionSchema),
  aiController.analyzeSession
);
router.get(
  "/ai/progress/:catalogId",
  auth,
  validateRequest(aiSchemas.analyzeProgressSchema),
  aiController.analyzeProgress
);

module.exports = router;
