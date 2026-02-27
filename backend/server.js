const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const activityRoutes = require("./routes/activityRoutes");
const activityLogger = require("./middleware/activityLogger");

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", true);

const configuredOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultDevOrigins = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = new Set([...defaultDevOrigins, ...configuredOrigins]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header) and configured browser origins.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // Allow localhost on any port for local development.
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json());
app.use(activityLogger);

app.get("/", (req, res) => {
  res.json({ message: "Student Course Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/activity", activityRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Server error"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});