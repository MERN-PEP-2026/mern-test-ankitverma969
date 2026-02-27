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
app.set("trust proxy", 1);

/* ======================================================
   🔥 UNIVERSAL CORS CONFIG (DEV + PROD + RENDER + VERCEL)
====================================================== */

// Environment Origins (comma separated in Render dashboard)
const envOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Default safe origins
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mern-test-ankitverma969.vercel.app"
];

// Merge everything
const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // Allow localhost any port
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (preview + production)
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Network-Provider",
    "X-Network-Type",
    "X-Network-Effective-Type",
    "X-Network-RTT",
    "X-Network-Downlink"
  ],
  exposedHeaders: ["Content-Length"],
  optionsSuccessStatus: 204
};

// Apply CORS BEFORE routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ======================================================
   MIDDLEWARES
====================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(activityLogger);

/* ======================================================
   ROUTES
====================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Course Management API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/activity", activityRoutes);

/* ======================================================
   404 HANDLER
====================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ======================================================
   SERVER START
====================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});