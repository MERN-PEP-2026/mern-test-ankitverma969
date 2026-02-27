const ActivityLog = require("../models/ActivityLog");

const getMyActivityLogs = async (req, res, next) => {
  try {
    const limitRaw = Number(req.query.limit || 20);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;

    const logs = await ActivityLog.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyActivityLogs
};