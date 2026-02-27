import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CourseForm from "../components/CourseForm";
import CourseCard from "../components/CourseCard";
import Navbar from "../components/Navbar";
import { createCourse, getCourses, getMyActivityLogs } from "../services/api";
import { ACTIVITY_LOG_KEY, LAST_VIEWED_COURSE_KEY } from "../constants/storageKeys";
import { getLatestCourses, isCourseExpired } from "../utils/courseUtils";
import "../styles/dashboard.css";

const getTrendData = (courses) => {
  const dayLabels = [];
  const map = new Map();

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString(undefined, { weekday: "short" });
    dayLabels.push(key);
    map.set(key, { key, label, count: 0 });
  }

  courses.forEach((course) => {
    const createdKey = new Date(course.createdAt).toISOString().slice(0, 10);
    if (map.has(createdKey)) {
      map.get(createdKey).count += 1;
    }
  });

  return dayLabels.map((key) => map.get(key));
};

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [lastViewedCourse, setLastViewedCourse] = useState(() => {
    try {
      const raw = localStorage.getItem(LAST_VIEWED_COURSE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [loadingUserActivity, setLoadingUserActivity] = useState(true);

  const courseNameInputRef = useRef(null);

  const addActivity = (text) => {
    const nextLog = [{ id: crypto.randomUUID(), text, time: new Date().toISOString() }, ...activityLog].slice(
      0,
      50
    );
    setActivityLog(nextLog);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(nextLog));
  };

  const fetchCourses = async () => {
    setError("");
    setLoadingCourses(true);

    try {
      const response = await getCourses("");
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchUserActivity = async () => {
    setLoadingUserActivity(true);
    try {
      const response = await getMyActivityLogs(100);
      setUserActivityLogs(response.data);
    } catch {
      setUserActivityLogs([]);
    } finally {
      setLoadingUserActivity(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchUserActivity();
  }, []);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === "n") {
        const targetTag = event.target?.tagName?.toLowerCase();
        if (targetTag === "input" || targetTag === "textarea") {
          return;
        }
        event.preventDefault();
        courseNameInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const trendData = useMemo(() => getTrendData(courses), [courses]);
  const maxTrendCount = useMemo(() => Math.max(...trendData.map((entry) => entry.count), 1), [trendData]);
  const latestCourses = useMemo(() => getLatestCourses(courses, 3), [courses]);
  const latestActivityLog = useMemo(() => activityLog.slice(0, 3), [activityLog]);
  const latestUserActivityLogs = useMemo(() => {
    return [...userActivityLogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [userActivityLogs]);

  const rememberedCourse = useMemo(() => {
    if (!lastViewedCourse) {
      return null;
    }
    return courses.find((course) => course._id === lastViewedCourse.id) || null;
  }, [courses, lastViewedCourse]);

  const handleCreateCourse = async (formData) => {
    setMessage("");
    setError("");
    setSubmittingCourse(true);

    try {
      const response = await createCourse(formData);
      setCourses((prev) => [response.data.course, ...prev]);
      setMessage("Course created successfully");
      addActivity(`Course '${response.data.course.courseName}' created`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleOpenCourse = (course) => {
    const payload = { id: course._id, name: course.courseName, viewedAt: new Date().toISOString() };
    localStorage.setItem(LAST_VIEWED_COURSE_KEY, JSON.stringify(payload));
    setLastViewedCourse(payload);
  };

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

  const parseActivityEntry = (entry) => {
    const marker = " at ";
    const markerIndex = entry.text.lastIndexOf(marker);
    if (markerIndex === -1) {
      return { title: entry.text, time: new Date(entry.time).toLocaleTimeString() };
    }
    return {
      title: entry.text.slice(0, markerIndex),
      time: entry.text.slice(markerIndex + marker.length)
    };
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        {!isOnline && (
          <div className="dashboard-alert offline">Offline - changes will sync later (UI only)</div>
        )}
        {message && <div className="dashboard-alert success">{message}</div>}
        {error && <div className="dashboard-alert error">{error}</div>}

        {rememberedCourse && (
          <div className="continue-banner">
            <span className="info-dot">i</span>
            Continue where you left off: <strong>{rememberedCourse.courseName}</strong>
          </div>
        )}

        <section className="dashboard-controls">
          <CourseForm
            onSubmit={handleCreateCourse}
            isSubmitting={submittingCourse}
            courseNameInputRef={courseNameInputRef}
          />

          <div className="sidebar-widgets">
            <div className="trend-block">
              <h2>
                <span className="heading-icon">#</span>
                Course Trend (7 days)
              </h2>
              <div className="trend-bars">
                {trendData.map((entry) => (
                  <div key={entry.key} className="trend-item">
                    <div
                      className="trend-bar"
                      style={{ height: `${Math.max((entry.count / maxTrendCount) * 100, 8)}%` }}
                      title={`${entry.count} course(s)`}
                    />
                    <span>{entry.label}</span>
                  </div>
                ))}
              </div>
              <p className="shortcut-hint">Shortcut: Press N to jump to create form</p>
            </div>
          </div>
        </section>

        <section className="courses-section preview-section">
          <div className="section-head">
            <h2>Latest Courses</h2>
            <Link to="/courses" className="detail-link">
              View all
            </Link>
          </div>
          {loadingCourses ? (
            <p className="status-text">Loading courses...</p>
          ) : latestCourses.length === 0 ? (
            <p className="status-text">No courses found. Create one to get started.</p>
          ) : (
            <div className="courses-grid">
              {latestCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onOpen={handleOpenCourse}
                  isExpired={isCourseExpired(course)}
                  isLastViewed={lastViewedCourse?.id === course._id}
                />
              ))}
            </div>
          )}
        </section>

        <section className="log-preview-grid">
          <aside className="activity-panel">
            <div className="section-head">
              <h2>
                <span className="heading-icon">o</span>
                Activity Log
              </h2>
              <Link to="/activity-log" className="detail-link">
                View all
              </Link>
            </div>
            {latestActivityLog.length === 0 ? (
              <p className="status-text compact">No activity yet.</p>
            ) : (
              <ul className="activity-timeline">
                {latestActivityLog.map((entry, index) => {
                  const parsed = parseActivityEntry(entry);
                  return (
                    <li key={entry.id}>
                      <span
                        className={`activity-dot ${index === 0 ? "green" : "blue"}`.trim()}
                        aria-hidden="true"
                      />
                      <div>
                        <p>{parsed.title}</p>
                        <small>at {parsed.time}</small>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <aside className="activity-panel server-activity-panel">
            <div className="section-head">
              <h2>
                <span className="heading-icon">S</span>
                Security & Device Logs
              </h2>
              <Link to="/security-logs" className="detail-link">
                View all
              </Link>
            </div>
            <p className="status-text compact">
              Carrier names like Jio/Vi are typically hidden by browsers for privacy.
            </p>
            {loadingUserActivity ? (
              <p className="status-text compact">Loading activity details...</p>
            ) : latestUserActivityLogs.length === 0 ? (
              <p className="status-text compact">No backend activity found yet.</p>
            ) : (
              <ul className="server-activity-list">
                {latestUserActivityLogs.map((entry) => (
                  <li key={entry._id}>
                    <div className="server-activity-head">
                      <strong className="server-action-tag">{entry.action}</strong>
                      <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="server-activity-grid">
                      <span>
                        Browser: <strong>{entry.browser || "Unknown"}</strong>
                      </span>
                      <span>
                        OS: <strong>{entry.os || "Unknown"}</strong>
                      </span>
                      <span>
                        Network: <strong>{entry.networkProvider || "private network"}</strong>
                      </span>
                      <span className="wide">
                        Request:{" "}
                        <strong>
                          {entry.method || "-"} {entry.path || "-"}
                        </strong>
                      </span>
                      <span className="wide ellipsis">API: {entry.apiAddress || "-"}</span>
                      <span>
                        Status: <strong>{entry.statusCode || "-"}</strong>
                      </span>
                      <span>
                        Latency: <strong>{formatLatency(entry.latencyMs)}</strong>
                      </span>
                      <span>
                        IP: <strong>{formatIp(entry.ipAddress)}</strong>
                      </span>
                      <span>
                        Quality:{" "}
                        <strong>
                          {entry.networkType || "unknown"} / {entry.effectiveType || "unknown"}
                        </strong>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </section>
      </main>

      <footer className="dashboard-footer">
        <div className="dashboard-content footer-content">
          <span>&copy; 2026 Student Course Manager. All rights reserved.</span>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

// Commmit message "Implemented the Dashboard page with course creation, trend visualization, activity logs, and security logs. Added offline detection and a continue banner for the last viewed course."