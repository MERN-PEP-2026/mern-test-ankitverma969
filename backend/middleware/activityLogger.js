const { getStudentIdFromToken, writeActivityLog } = require("../services/activityLogService");

const NON_LOGGED_PATHS = ["/api/activity/me"];

const activityLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", async () => {
    if (NON_LOGGED_PATHS.some((path) => req.originalUrl.startsWith(path))) {
      return;
    }

    const studentId = req.user?.id || getStudentIdFromToken(req);
    if (!studentId) {
      return;
    }

    const endedAt = process.hrtime.bigint();
    const latencyMs = Number(endedAt - startedAt) / 1e6;

    try {
      await writeActivityLog({
        studentId,
        action: "API_REQUEST",
        req,
        statusCode: res.statusCode,
        latencyMs: Math.round(latencyMs * 100) / 100,
        responseBytes: res.getHeader("content-length")
      });
    } catch (error) {
      // Logging should never block API responses.
      console.error("Activity logging failed:", error.message);
    }
  });

  next();
};

module.exports = activityLogger;
