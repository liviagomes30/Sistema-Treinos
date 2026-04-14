const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const logController = require("../controllers/logController");

// /api/exercises/:exerciseId/history
router.get("/:exerciseId/history", auth, logController.getHistory);

module.exports = router;
