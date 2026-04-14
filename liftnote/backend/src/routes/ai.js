const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const aiController = require("../controllers/aiController");

// POST /api/ai/analyze/:sessionId  — analisa a sessão finalizada
router.post("/analyze/:sessionId", auth, aiController.analyzeSession);

// GET /api/ai/progress/:exerciseId  — analisa evolução histórica de um exercício
router.get("/progress/:exerciseId", auth, aiController.analyzeProgress);

module.exports = router;
