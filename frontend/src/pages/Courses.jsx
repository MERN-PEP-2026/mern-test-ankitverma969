import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import Navbar from "../components/Navbar";
import { deleteCourse, getCourses, toggleCoursePin, updateCourse } from "../services/api";
import { LAST_VIEWED_COURSE_KEY } from "../constants/storageKeys";
import { isCourseExpired, sortCourses } from "../utils/courseUtils";
import "../styles/dashboard.css";

const INITIAL_FILTERS = {
  instructor: "",
  pinned: "",
  status: ""
};

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastViewedCourse, setLastViewedCourse] = useState(() => {
    try {
      const raw = localStorage.getItem(LAST_VIEWED_COURSE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({
    courseName: "",
    courseDescription: "",
    instructor: "",
    validTill: ""
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCourses = async (query = {}) => {
    setLoadingCourses(true);
    setError("");
    try {
      const response = await getCourses(query);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCourses({
        search: searchTerm.trim(),
        instructor: filters.instructor,
        pinned: filters.pinned,
        status: filters.status
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters.instructor, filters.pinned, filters.status]);

  const sortedCourses = useMemo(() => sortCourses(courses), [courses]);
  const instructorOptions = useMemo(() => {
    const unique = new Set(courses.map((course) => course.instructor).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setEditForm({
      courseName: course.courseName || "",
      courseDescription: course.courseDescription || "",
      instructor: course.instructor || "",
      validTill: course.validTill ? new Date(course.validTill).toISOString().slice(0, 10) : ""
    });
  };

  const handleEditCourse = async (event) => {
    event.preventDefault();
    if (!editingCourse) {
      return;
    }

    setSavingEdit(true);
    setMessage("");
    setError("");

    try {
      const response = await updateCourse(editingCourse._id, {
        courseName: editForm.courseName.trim(),
        courseDescription: editForm.courseDescription.trim(),
        instructor: editForm.instructor.trim(),
        validTill: editForm.validTill || null
      });
      setCourses((prev) =>
        prev.map((existing) => (existing._id === editingCourse._id ? response.data.course : existing))
      );
      setMessage("Course updated successfully");
      setEditingCourse(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this course?");
    if (!isConfirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((course) => course._id !== id));
      setMessage("Course deleted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handlePinCourse = async (id) => {
    setMessage("");
    setError("");

    try {
      const response = await toggleCoursePin(id);
      setCourses((prev) =>
        prev.map((course) => (course._id === id ? { ...course, isPinned: response.data.course.isPinned } : course))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update pin status");
    }
  };

  const handleOpenCourse = (course) => {
    const payload = { id: course._id, name: course.courseName, viewedAt: new Date().toISOString() };
    localStorage.setItem(LAST_VIEWED_COURSE_KEY, JSON.stringify(payload));
    setLastViewedCourse(payload);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="dashboard-page courses-page">
      <Navbar />
      <main className="dashboard-content">
        <div className="courses-bg-orb orb-one" aria-hidden="true" />
        <div className="courses-bg-orb orb-two" aria-hidden="true" />

        {message && <div className="dashboard-alert success">{message}</div>}
        {error && <div className="dashboard-alert error">{error}</div>}

        <section className="courses-header">
          <div>
            <h1>Courses</h1>
            <p>Search, filter, and manage all academic offerings.</p>
          </div>
          <button
            type="button"
            className="add-course-btn"
            onClick={() => navigate("/dashboard")}
          >
            + Add New Course
          </button>
        </section>

        <section className="search-block detail-search courses-filter-bar">
          <div className="course-filter-grid">
            <input
              type="text"
              placeholder="Search by course name, description, or instructor..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={filters.instructor}
              onChange={(event) => setFilters((prev) => ({ ...prev, instructor: event.target.value }))}
            >
              <option value="">All Instructors</option>
              {instructorOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={filters.pinned}
              onChange={(event) => setFilters((prev) => ({ ...prev, pinned: event.target.value }))}
            >
              <option value="">All Pin States</option>
              <option value="true">Pinned</option>
              <option value="false">Unpinned</option>
            </select>

            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            <button type="button" className="filter-reset-btn" onClick={clearFilters}>
              Reset
            </button>
          </div>
        </section>

        <section className="courses-section">
          {loadingCourses ? (
            <p className="status-text">Loading courses...</p>
          ) : sortedCourses.length === 0 ? (
            <p className="status-text">No courses found.</p>
          ) : (
            <div className="courses-grid">
              {sortedCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  variant="catalog"
                  onDelete={handleDeleteCourse}
                  onPin={handlePinCourse}
                  onEdit={handleOpenEdit}
                  onOpen={handleOpenCourse}
                  isExpired={isCourseExpired(course)}
                  isLastViewed={lastViewedCourse?.id === course._id}
                />
              ))}
            </div>
          )}
        </section>

        <div className="courses-results-footer">
          Showing {sortedCourses.length} course{sortedCourses.length === 1 ? "" : "s"}
        </div>

        {editingCourse && (
          <div className="edit-course-overlay" role="presentation" onClick={() => setEditingCourse(null)}>
            <div
              className="edit-course-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Edit course"
              onClick={(event) => event.stopPropagation()}
            >
              <h2>Edit Course</h2>
              <form className="edit-course-form" onSubmit={handleEditCourse}>
                <input
                  type="text"
                  placeholder="Course name"
                  value={editForm.courseName}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, courseName: event.target.value }))
                  }
                  required
                />
                <textarea
                  rows="4"
                  placeholder="Course description"
                  value={editForm.courseDescription}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, courseDescription: event.target.value }))
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Instructor"
                  value={editForm.instructor}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, instructor: event.target.value }))
                  }
                  required
                />
                <input
                  type="date"
                  value={editForm.validTill}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, validTill: event.target.value }))
                  }
                />
                <div className="edit-course-actions">
                  <button type="button" className="secondary-btn" onClick={() => setEditingCourse(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={savingEdit}>
                    {savingEdit ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;