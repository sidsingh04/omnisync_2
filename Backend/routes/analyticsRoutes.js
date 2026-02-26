const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/metrics", analyticsController.getMetrics);
router.get("/available-months", analyticsController.getAvailableMonths);
router.get("/monthly-data", analyticsController.getMonthlyData);
router.get("/agent-status-metrics", analyticsController.getAgentStatusMetrics);

module.exports = router;
