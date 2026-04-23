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

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticação de usuários no app
 *   - name: Catalog
 *     description: Catálogo global de exercícios
 *   - name: Workouts
 *     description: Gerenciamento de rotinas de treino do usuário
 *   - name: Workout Exercises
 *     description: Exercícios dentro de uma rotina
 *   - name: Sessions
 *     description: Sessões de treino realizadas baseadas em uma rotina
 *   - name: Logs
 *     description: Histórico de execuções de exercícios
 *   - name: AI
 *     description: Feedbacks inteligentes gerados pelo Gemini
 */

// ─── AUTH (público) ────────────────────────────────────────────
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cria uma conta nova de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Criado com sucesso (retorna perfil e token)
 *       400:
 *         description: Email já existe ou dados incorretos
 */
router.post("/auth/register", rateLimiter, validateRequest(authSchemas.registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login (Retorna o JWT de acesso)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticação com sucesso (retorna usuário logado e token)
 *       401:
 *         description: Credenciais incorretas
 */
router.post("/auth/login", rateLimiter, validateRequest(authSchemas.loginSchema), authController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita link de recuperação (fake implementation)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Enviado
 */
router.post("/auth/forgot-password", rateLimiter, validateRequest(authSchemas.forgotPasswordSchema), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine a senha com o token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida localmente
 */
router.post("/auth/reset-password", rateLimiter, validateRequest(authSchemas.resetPasswordSchema), authController.resetPassword);

const catalogSchemas = require("../validators/exerciseCatalogSchemas");

// ─── CATÁLOGO GLOBAL DE EXERCÍCIOS ────────────────────────────
/**
 * @swagger
 * /catalog:
 *   get:
 *     summary: Lista o catálogo global
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista páginada
 */
router.get("/catalog", auth, validateRequest(catalogSchemas.getCatalogSchema), exerciseCatalogController.getAll);

/**
 * @swagger
 * /catalog:
 *   post:
 *     summary: Adiciona arquivo manual local no catalogo
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, bodyPart, target]
 *             properties:
 *               name:
 *                 type: string
 *               bodyPart:
 *                 type: string
 *               target:
 *                 type: string
 *     responses:
 *       201:
 *         description: Adicionado
 */
router.post("/catalog", auth, validateRequest(catalogSchemas.createCatalogSchema), exerciseCatalogController.create);

/**
 * @swagger
 * /catalog/{id}:
 *   get:
 *     summary: Busca o exercicio detalhado
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/catalog/:id", auth, exerciseCatalogController.getOne);

/**
 * @swagger
 * /catalog/{id}:
 *   put:
 *     summary: Atualiza infos do exercício
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atualizado
 */
router.put("/catalog/:id", auth, validateRequest(catalogSchemas.updateCatalogSchema), exerciseCatalogController.update);

/**
 * @swagger
 * /catalog/{id}:
 *   delete:
 *     summary: Apaga um exercicio
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excluido
 */
router.delete("/catalog/:id", auth, exerciseCatalogController.remove);

/**
 * @swagger
 * /catalog/{catalogId}/history:
 *   get:
 *     summary: Pega historico de treinos pelo exercicio para um User (Graph Data)
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catalogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes
 */
router.get("/catalog/:catalogId/history", auth, logController.getHistory);

const workoutSchemas = require("../validators/workoutSchemas");
const workoutExerciseSchemas = require("../validators/workoutExerciseSchemas");
const sessionSchemas = require("../validators/sessionSchemas");
const logSchemas = require("../validators/logSchemas");

// ─── WORKOUTS ─────────────────────────────────────────────────
/**
 * @swagger
 * /workouts:
 *   get:
 *     summary: Pega todas as suas rotinas (Workouts do usuário)
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista
 */
router.get("/workouts", auth, workoutController.getAll);

/**
 * @swagger
 * /workouts/{id}:
 *   get:
 *     summary: Busca o workout e traz os exercicios
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Único workout retornado
 */
router.get("/workouts/:id", auth, workoutController.getOne);

/**
 * @swagger
 * /workouts:
 *   post:
 *     summary: Cria uma rotina do zero
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: OK
 */
router.post("/workouts", auth, validateRequest(workoutSchemas.createWorkoutSchema), workoutController.create);

/**
 * @swagger
 * /workouts/{id}:
 *   put:
 *     summary: Atualiza titulo rotina
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/workouts/:id", auth, validateRequest(workoutSchemas.updateWorkoutSchema), workoutController.update);

/**
 * @swagger
 * /workouts/{id}:
 *   delete:
 *     summary: Apaga rotina
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: DELETED
 */
router.delete("/workouts/:id", auth, workoutController.remove);

// ─── WORKOUT EXERCISES (aninhado em workout) ──────────────────
/**
 * @swagger
 * /workouts/{workoutId}/exercises/reorder:
 *   patch:
 *     summary: Salva nova ordem enviando toda lista [id]
 *     tags: [Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [exercises]
 *             properties:
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: OK Reordena
 */
router.patch("/workouts/:workoutId/exercises/reorder", auth, validateRequest(workoutExerciseSchemas.reorderWorkoutExerciseSchema), workoutExerciseController.reorder);

/**
 * @swagger
 * /workouts/{workoutId}/exercises:
 *   get:
 *     summary: Pega a listagem ordenada de WorkoutExercises de 1 workout
 *     tags: [Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of Workout Exercises with populated Catalog details
 */
router.get("/workouts/:workoutId/exercises", auth, workoutExerciseController.getAll);

/**
 * @swagger
 * /workouts/{workoutId}/exercises/{id}:
 *   get:
 *     summary: Pega UM item WorkoutExercises
 *     tags: [Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return ONE
 */
router.get("/workouts/:workoutId/exercises/:id", auth, workoutExerciseController.getOne);

/**
 * @swagger
 * /workouts/{workoutId}/exercises:
 *   post:
 *     summary: Insere Exercicio ao treino
 *     tags: [Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [catalogId]
 *             properties:
 *               catalogId:
 *                 type: string
 *               order:
 *                 type: number
 *               targetSets:
 *                 type: number
 *               targetReps:
 *                 type: number
 *     responses:
 *       201:
 *         description: Added
 */
router.post("/workouts/:workoutId/exercises", auth, validateRequest(workoutExerciseSchemas.createWorkoutExerciseSchema), workoutExerciseController.create);

/**
 * @swagger
 * /workouts/{workoutId}/exercises/{id}:
 *   put:
 *     summary: Ajusta target local (Sets / Reps) e Notes
 *     tags: [Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetSets:
 *                 type: number
 *               targetReps:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success update
 */
router.put("/workouts/:workoutId/exercises/:id", auth, validateRequest(workoutExerciseSchemas.updateWorkoutExerciseSchema), workoutExerciseController.update);

/**
 * @swagger
 * /workouts/{workoutId}/exercises/{id}:
 *   delete:
 *     summary: Elimina de vez o exercicio do Workout
 *     tags: [Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gone
 */
router.delete("/workouts/:workoutId/exercises/:id", auth, workoutExerciseController.remove);

// ─── SESSIONS ─────────────────────────────────────────────────
/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Retorna sessões (Histórico diário - Listagem global de passados)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/sessions", auth, validateRequest(sessionSchemas.getSessionsSchema), sessionController.getAll);

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Retorna infos da Section atual para Play / Review
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active view play
 */
router.get("/sessions/:id", auth, sessionController.getOne);

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Inicia 1 Session ao clicar no play Workout (Cria 1 id Session)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workoutId]
 *             properties:
 *               workoutId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sessao foi aberta status = 'in_progress'
 */
router.post("/sessions", auth, validateRequest(sessionSchemas.createSessionSchema), sessionController.create);

/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Faz FINISH na Section mudando Status para 'completed'. Adiciona duração total
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed, abandoned]
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sessão salva (fim de treino)
 */
router.put("/sessions/:id", auth, validateRequest(sessionSchemas.updateSessionSchema), sessionController.update);

/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Abortar sessão (lixeira limpa do banco) 
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excluido limpo logs filhos juntos
 */
router.delete("/sessions/:id", auth, sessionController.remove);

// ─── EXERCISE LOGS (aninhado em session) ──────────────────────
/**
 * @swagger
 * /sessions/{sessionId}/logs:
 *   get:
 *     summary: Retorna listagem dos sets registrados dentro dessta sessão ativa (Play Screen data)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: array sets list
 */
router.get("/sessions/:sessionId/logs", auth, logController.getAll);

/**
 * @swagger
 * /sessions/{sessionId}/logs:
 *   post:
 *     summary: Salva marcação de Tique (Adiciona Rep/Weight numa session ativada para certo exercício)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workoutExerciseId, reps, weight]
 *             properties:
 *               workoutExerciseId:
 *                 type: string
 *               reps:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Set logged!
 */
router.post("/sessions/:sessionId/logs", auth, validateRequest(logSchemas.createLogSchema), logController.create);

/**
 * @swagger
 * /sessions/{sessionId}/logs/{id}:
 *   put:
 *     summary: Edita 1 info da linha clicada log caso erro 
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reps:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Edit valid
 */
router.put("/sessions/:sessionId/logs/:id", auth, validateRequest(logSchemas.updateLogSchema), logController.update);

/**
 * @swagger
 * /sessions/{sessionId}/logs/{id}:
 *   delete:
 *     summary: Undo delete da série inserida
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete("/sessions/:sessionId/logs/:id", auth, logController.remove);

const aiSchemas = require("../validators/aiSchemas");

// ─── AI ───────────────────────────────────────────────────────
/**
 * @swagger
 * /ai/analyze/{sessionId}:
 *   post:
 *     summary: Avaliaçao geral resumida da AI pos-secao finalizada motivando resultados usando Gemini 
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback text string prompt object result
 */
router.post("/ai/analyze/:sessionId", auth, validateRequest(aiSchemas.analyzeSessionSchema), aiController.analyzeSession);

/**
 * @swagger
 * /ai/progress/{catalogId}:
 *   get:
 *     summary: Avalia chart com Gemini (Apto progressao overload alert?) usando os historicos 
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catalogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message with string content overload analysis check up OK
 */
router.get("/ai/progress/:catalogId", auth, validateRequest(aiSchemas.analyzeProgressSchema), aiController.analyzeProgress);

module.exports = router;
