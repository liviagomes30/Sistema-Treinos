const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const sessionController = require("../controllers/sessionController");
const logController = require("../controllers/logController");

// /api/sessions
router.get("/", auth, sessionController.getAll);
router.post("/", auth, sessionController.create);
router.get("/:id", auth, sessionController.getOne);
router.put("/:id", auth, sessionController.update);
router.delete("/:id", auth, sessionController.remove);

// /api/sessions/:sessionId/logs
router.get("/:sessionId/logs", auth, logController.getAll);
router.post("/:sessionId/logs", auth, logController.create);
router.put("/:sessionId/logs/:id", auth, logController.update);
router.delete("/:sessionId/logs/:id", auth, logController.remove);

module.exports = router;
