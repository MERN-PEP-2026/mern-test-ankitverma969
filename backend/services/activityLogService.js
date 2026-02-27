const jwt = require("jsonwebtoken");
const ActivityLog = require("../models/ActivityLog");

const normalizeIp = (value = "") => {
  if (!value || typeof value !== "string") {
    return "";
  }

  let ip = value.trim();
  if (!ip) {
    return "";
  }

  // Handle forwarded values like: "203.0.113.7:1234"
  if (ip.includes(":") && ip.includes(".") && ip.lastIndexOf(":") > ip.lastIndexOf(".")) {
    ip = ip.slice(0, ip.lastIndexOf(":"));
  }

  // Normalize IPv4-mapped IPv6 values like ::ffff:127.0.0.1
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  if (ip === "::1") {
    return "127.0.0.1";
  }

  return ip;
};

const getFullApiAddress = (req) => {
  const protocolHeader = req.headers["x-forwarded-proto"];
  const protocol =
    (typeof protocolHeader === "string" && protocolHeader.split(",")[0].trim()) ||
    req.protocol ||
    "http";
  const host = req.get("host") || req.headers.host || "localhost:5000";
  return `${protocol}://${host}${req.originalUrl}`;
};

const getClientIp = (req) => {
  const cfConnectingIp = normalizeIp(req.headers["cf-connecting-ip"]);
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xRealIp = normalizeIp(req.headers["x-real-ip"]);
  if (xRealIp) {
    return xRealIp;
  }

  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded && typeof forwarded === "string" && forwarded.trim()) {
    return normalizeIp(forwarded.split(",")[0]);
  }

  return (
    normalizeIp(req.ip) ||
    normalizeIp(req.socket?.remoteAddress) ||
    normalizeIp(req.connection?.remoteAddress) ||
    ""
  );
};

const parseUserAgent = (ua = "") => {
  const normalizedUA = ua.toLowerCase();

  let browser = "Unknown";
  if (normalizedUA.includes("edg/")) {
    browser = "Edge";
  } else if (normalizedUA.includes("opr/") || normalizedUA.includes("opera")) {
    browser = "Opera";
  } else if (normalizedUA.includes("chrome/")) {
    browser = "Chrome";
  } else if (normalizedUA.includes("firefox/")) {
    browser = "Firefox";
  } else if (normalizedUA.includes("safari/")) {
    browser = "Safari";
  }

  let os = "Unknown";
  if (normalizedUA.includes("windows")) {
    os = "Windows";
  } else if (normalizedUA.includes("android")) {
    os = "Android";
  } else if (normalizedUA.includes("iphone") || normalizedUA.includes("ipad")) {
    os = "iOS";
  } else if (normalizedUA.includes("mac os")) {
    os = "macOS";
  } else if (normalizedUA.includes("linux")) {
    os = "Linux";
  }

  let deviceType = "Desktop";
  if (normalizedUA.includes("ipad") || normalizedUA.includes("tablet")) {
    deviceType = "Tablet";
  } else if (
    normalizedUA.includes("mobile") ||
    normalizedUA.includes("android") ||
    normalizedUA.includes("iphone")
  ) {
    deviceType = "Mobile";
  }

  return { browser, os, deviceType };
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const extractContext = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const userAgentInfo = parseUserAgent(userAgent);

  return {
    method: req.method,
    path: req.originalUrl,
    apiAddress: getFullApiAddress(req),
    ipAddress: getClientIp(req),
    userAgent,
    browser: userAgentInfo.browser,
    os: userAgentInfo.os,
    deviceType: userAgentInfo.deviceType,
    networkProvider:
      req.headers["x-network-provider"] ||
      "private network",
    networkType: req.headers["x-network-type"] || "unknown",
    effectiveType: req.headers["x-network-effective-type"] || "unknown",
    rtt: toNumber(req.headers["x-network-rtt"]),
    downlink: toNumber(req.headers["x-network-downlink"]),
    requestBytes: toNumber(req.headers["content-length"]),
    responseBytes: undefined
  };
};

const getStudentIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

const writeActivityLog = async ({
  studentId,
  action,
  req,
  statusCode,
  latencyMs,
  responseBytes
}) => {
  if (!studentId || !action) {
    return;
  }

  const context = extractContext(req);

  await ActivityLog.create({
    student: studentId,
    action,
    statusCode,
    latencyMs,
    responseBytes: toNumber(responseBytes),
    ...context
  });
};

module.exports = {
  getStudentIdFromToken,
  writeActivityLog
};