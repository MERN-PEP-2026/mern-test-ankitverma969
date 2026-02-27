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

/* ===============================
   CORS CONFIGURATION
=================================*/

// Get origins from environment variable (Render)
const configuredOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Default allowed origins (development + production)
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mern-test-ankitverma969.vercel.app"
];

// Merge all allowed origins
const allowedOrigins = new Set([
  ...defaultDevOrigins,
  ...configuredOrigins
]);

// Apply CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // Allow localhost with any port
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Handle preflight requests
app.options("*", cors());

/* ===============================
   MIDDLEWARES
=================================*/

app.use(express.json());
app.use(activityLogger);

/* ===============================
   ROUTES
=================================*/

app.get("/", (req, res) => {
  res.json({ message: "Student Course Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/activity", activityRoutes);

/* ===============================
   GLOBAL ERROR HANDLER
=================================*/

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error"
  });
});

/* ===============================
   SERVER START
=================================*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});