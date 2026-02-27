import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { ACTIVITY_LOG_KEY } from "../constants/storageKeys";
import "../styles/dashboard.css";

const TAB_OPTIONS = [
  { id: "all", label: "All Activities" },
  { id: "course", label: "Course Updates" },
  { id: "system", label: "System Logs" }
];

const getActivityMeta = (text = "") => {
  const value = text.toLowerCase();

  if (value.includes("created")) {
    return {
      type: "course",
      icon: "+",
      accent: "green",
      badge: "Success"
    };
  }

  if (value.includes("submit") || value.includes("upload")) {
    return {
      type: "course",
      icon: "?",
      accent: "blue",
      badge: "Assignment"
    };
  }

  if (value.includes("delete") || value.includes("remove")) {
    return {
      type: "system",
      icon: "-",
      accent: "rose",
      badge: "Action"
    };
  }

  if (value.includes("profile") || value.includes("contact")) {
    return {
      type: "system",
      icon: "?",
      accent: "amber",
      badge: "Profile"
    };
  }

  if (value.includes("module") || value.includes("chapter")) {
    return {
      type: "course",
      icon: "?",
      accent: "indigo",
      badge: "Content"
    };
  }

  return {
    type: "system",
    icon: "o",
    accent: "slate",
    badge: "System"
  };
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });

const ActivityLog = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
      setActivityLog(raw ? JSON.parse(raw) : []);
    } catch {
      setActivityLog([]);
    }
  }, []);

  const sortedActivity = useMemo(() => {
    return [...activityLog]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .map((entry) => ({
        ...entry,
        meta: getActivityMeta(entry.text)
      }));
  }, [activityLog]);

  const filteredActivity = useMemo(() => {
    if (activeTab === "all") {
      return sortedActivity;
    }
    return sortedActivity.filter((entry) => entry.meta.type === activeTab);
  }, [activeTab, sortedActivity]);

  const recentItems = filteredActivity.slice(0, 4);
  const olderItems = filteredActivity.slice(4);

  const handleCycleFilter = () => {
    const index = TAB_OPTIONS.findIndex((tab) => tab.id === activeTab);
    const next = TAB_OPTIONS[(index + 1) % TAB_OPTIONS.length];
    setActiveTab(next.id);
  };

  const handleExport = () => {
    if (filteredActivity.length === 0) {
      return;
    }

    const csvLines = ["Activity,Time,Date,Type"];

    filteredActivity.forEach((entry) => {
      const line = [
        `"${(entry.text || "").replaceAll('"', '""')}"`,
        `"${formatTime(entry.time)}"`,
        `"${formatDate(entry.time)}"`,
        `"${entry.meta.badge}"`
      ].join(",");
      csvLines.push(line);
    });

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "activity-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-page activity-log-page">
      <Navbar />

      <main className="dashboard-content activity-log-content">
        <div className="activity-log-orb orb-left" aria-hidden="true" />
        <div className="activity-log-orb orb-right" aria-hidden="true" />

        <section className="activity-log-header">
          <div>
            <h1>Activity Log</h1>
            <p>Track your recent system actions and course updates in real-time.</p>
          </div>
          <div className="activity-log-actions">
            <button type="button" onClick={handleCycleFilter} className="activity-action-btn">
              Filter
            </button>
            <button type="button" onClick={handleExport} className="activity-action-btn">
              Export
            </button>
          </div>
        </section>

        <section className="activity-log-card">
          <div className="activity-tabs" role="tablist" aria-label="Activity log tabs">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`activity-tab ${activeTab === tab.id ? "active" : ""}`.trim()}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredActivity.length === 0 ? (
            <p className="status-text compact">No activity yet.</p>
          ) : (
            <>
              <ul className="activity-log-list">
                {recentItems.map((entry) => (
                  <li key={entry.id} className="activity-log-item">
                    <span className={`activity-item-icon ${entry.meta.accent}`.trim()} aria-hidden="true">
                      {entry.meta.icon}
                    </span>
                    <div className="activity-item-body">
                      <div className="activity-item-head">
                        <h3>{entry.text}</h3>
                        <span>{formatTime(entry.time)}</span>
                      </div>
                      <div className="activity-item-meta">
                        <strong className={`activity-badge ${entry.meta.accent}`.trim()}>{entry.meta.badge}</strong>
                        <small>{formatDate(entry.time)}</small>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {olderItems.length > 0 && (
                <>
                  <div className="activity-divider" aria-hidden="true">
                    <span>Earlier this week</span>
                  </div>
                  <ul className="activity-log-list older">
                    {olderItems.map((entry) => (
                      <li key={entry.id} className="activity-log-item">
                        <span className={`activity-item-icon ${entry.meta.accent}`.trim()} aria-hidden="true">
                          {entry.meta.icon}
                        </span>
                        <div className="activity-item-body">
                          <div className="activity-item-head">
                            <h3>{entry.text}</h3>
                            <span>{formatTime(entry.time)}</span>
                          </div>
                          <div className="activity-item-meta">
                            <strong className={`activity-badge ${entry.meta.accent}`.trim()}>{entry.meta.badge}</strong>
                            <small>{formatDate(entry.time)}</small>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default ActivityLog;