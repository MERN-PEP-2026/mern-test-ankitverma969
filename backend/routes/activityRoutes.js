const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getMyActivityLogs } = require("../controllers/activityController");

const router = express.Router();

router.get("/me", protect, getMyActivityLogs);

module.exports = router;
