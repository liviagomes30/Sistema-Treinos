const service = require("../services/aiService");

// POST /api/ai/analyze/:sessionId — análise de uma sessão específica
const analyzeSession = async (req, res, next) => {
  try {
    const result = await service.analyzeSession(
      req.params.sessionId,
      req.user._id,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/ai/progress/:catalogId — análise de progresso de um exercício
const analyzeProgress = async (req, res, next) => {
  try {
    const result = await service.analyzeProgress(
      req.params.catalogId,
      req.user._id,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/ai/weekly-coach — relatório do coach por período
const weeklyCoach = async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks) || 4;
    const result = await service.weeklyCoach(req.user._id, weeks);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeSession, analyzeProgress, weeklyCoach };
