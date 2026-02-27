const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    method: {
      type: String,
      trim: true
    },
    path: {
      type: String,
      trim: true
    },
    apiAddress: {
      type: String,
      trim: true
    },
    statusCode: {
      type: Number
    },
    latencyMs: {
      type: Number
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    browser: {
      type: String,
      trim: true
    },
    os: {
      type: String,
      trim: true
    },
    deviceType: {
      type: String,
      trim: true
    },
    networkProvider: {
      type: String,
      trim: true
    },
    networkType: {
      type: String,
      trim: true
    },
    effectiveType: {
      type: String,
      trim: true
    },
    rtt: {
      type: Number
    },
    downlink: {
      type: Number
    },
    requestBytes: {
      type: Number
    },
    responseBytes: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
