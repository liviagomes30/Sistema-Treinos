const service = require("../services/aiService");

/**
 * POST /api/ai/analyze/:sessionId
 */
const analyzeSession = async (req, res, next) => {
  try {
    const result = await service.analyzeSession(req.params.sessionId, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ai/progress/:catalogId
 */
const analyzeProgress = async (req, res, next) => {
  try {
    const result = await service.analyzeProgress(req.params.catalogId, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeSession, analyzeProgress };
