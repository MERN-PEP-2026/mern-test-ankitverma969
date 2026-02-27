import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyActivityLogs } from "../services/api";
import "../styles/dashboard.css";

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await getMyActivityLogs(100);
        setLogs(response.data);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatLatency = (value) => {
    if (typeof value !== "number") {
      return "--";
    }
    return `${value.toFixed(2)} ms`;
  };

  const formatIp = (value) => {
    if (!value) {
      return "-";
    }
    if (value === "::1") {
      return "127.0.0.1";
    }
    return value;
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-content">
        <section className="detail-header">
          <h1>Security & Device Logs</h1>
          <p>Detailed view of browser, network, and request activity.</p>
        </section>

        <section className="activity-panel server-activity-panel detail-panel">
          <p className="status-text compact">
            Carrier names like Jio/Vi are typically hidden by browsers for privacy.
          </p>
          {loading ? (
            <p className="status-text compact">Loading activity details...</p>
          ) : logs.length === 0 ? (
            <p className="status-text compact">No backend activity found yet.</p>
          ) : (
            <ul className="server-activity-list">
              {logs.map((entry) => (
                <li key={entry._id}>
                  <div className="server-activity-head">
                    <strong>{entry.action}</strong>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="server-activity-grid">
                    <span>Browser: {entry.browser || "Unknown"}</span>
                    <span>OS: {entry.os || "Unknown"}</span>
                    <span>Network: {entry.networkProvider || "private network"}</span>
                    <span>
                      Request: {entry.method || "-"} {entry.path || "-"}
                    </span>
                    <span>API: {entry.apiAddress || "-"}</span>
                    <span>Status: {entry.statusCode || "-"}</span>
                    <span>Latency: {formatLatency(entry.latencyMs)}</span>
                    <span>IP: {formatIp(entry.ipAddress)}</span>
                    <span>
                      Quality: {entry.networkType || "unknown"} / {entry.effectiveType || "unknown"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default SecurityLogs;