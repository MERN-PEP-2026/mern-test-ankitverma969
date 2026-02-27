import "../styles/courseCard.css";

const ADVANCED_KEYWORDS = ["advanced", "expert", "architecture", "deep dive"];
const BEGINNER_KEYWORDS = ["basic", "basics", "introduction", "intro", "beginner", "fundamentals"];

const getDifficulty = (description = "") => {
  const text = description.toLowerCase();

  if (ADVANCED_KEYWORDS.some((keyword) => text.includes(keyword)) || text.length > 170) {
    return { label: "Advanced", className: "advanced", dot: "" };
  }

  if (BEGINNER_KEYWORDS.some((keyword) => text.includes(keyword)) || text.length < 85) {
    return { label: "Beginner", className: "beginner", dot: "" };
  }

  return { label: "Intermediate", className: "intermediate", dot: "" };
};

const getDaysLeft = (dateString) => {
  if (!dateString) {
    return null;
  }
  const now = new Date();
  const target = new Date(dateString);
  target.setHours(23, 59, 59, 999);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

const getInstructorColor = (name = "") => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 75% 42%)`;
};

const getReadTime = (description = "") => {
  const words = description.trim().split(/\s+/).filter(Boolean).length;
  if (!words) {
    return "0 min";
  }
  return `${Math.max(1, Math.ceil(words / 200))} min`;
};

const getInitials = (value = "") => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "NA";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const CourseCard = ({
  course,
  onDelete,
  onPin,
  onEdit,
  onOpen,
  isExpired,
  isLastViewed,
  variant = "default"
}) => {
  const createdDate = new Date(course.createdAt).toLocaleDateString();
  const difficulty = getDifficulty(course.courseDescription);
  const daysLeft = getDaysLeft(course.validTill);

  let expiryText = "No deadline";
  if (course.validTill) {
    if (daysLeft < 0) {
      expiryText = "Expired";
    } else if (daysLeft === 0) {
      expiryText = "Expires today";
    } else if (daysLeft === 1) {
      expiryText = "Expires in 1 day";
    } else {
      expiryText = `Expires in ${daysLeft} days`;
    }
  }

  if (variant === "catalog") {
    const courseInitials = getInitials(course.courseName);
    const instructorInitials = getInitials(course.instructor);
    const topBadgeText = course.validTill ? expiryText.toUpperCase() : difficulty.label.toUpperCase();
    const topBadgeClass = course.validTill
      ? `expiry-badge ${isExpired ? "expired" : "active"}`
      : `difficulty-badge ${difficulty.className}`;

    return (
      <article
        className={`course-card catalog ${isExpired ? "expired" : ""} ${isLastViewed ? "last-viewed" : ""}`.trim()}
        onClick={() => onOpen?.(course)}
      >
        <div className="catalog-top">
          <div className="catalog-initials">{courseInitials}</div>
          <span className={topBadgeClass}>{topBadgeText}</span>
        </div>

        <h3 className="catalog-title">{course.courseName}</h3>
        <p className="catalog-description">{course.courseDescription}</p>

        <div className="catalog-footer">
          <div className="catalog-instructor">
            <span className="catalog-avatar">{instructorInitials}</span>
            <span>{course.instructor}</span>
          </div>
          <div className="catalog-actions">
            {onPin && (
              <button
                type="button"
                className={`pin-btn ${course.isPinned ? "active" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onPin(course._id);
                }}
                title={course.isPinned ? "Unpin course" : "Pin course"}
              >
                {course.isPinned ? "Unpin" : "Pin"}
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                className="edit-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(course);
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="delete-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(course._id);
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <div className="catalog-meta">Created: {createdDate}</div>
      </article>
    );
  }

  return (
    <article
      className={`course-card ${isExpired ? "expired" : ""} ${isLastViewed ? "last-viewed" : ""}`.trim()}
      onClick={() => onOpen?.(course)}
    >
      <div className="course-header-row">
        <h3>{course.courseName}</h3>
        {onPin && (
          <button
            type="button"
            className={`pin-btn ${course.isPinned ? "active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onPin(course._id);
            }}
            title={course.isPinned ? "Unpin course" : "Pin course"}
          >
            {course.isPinned ? "Unpin" : "Pin"}
          </button>
        )}
      </div>

      <div className="badge-row">
        <span className={`difficulty-badge ${difficulty.className}`}>
          {difficulty.dot ? `${difficulty.dot} ` : ""}
          {difficulty.label}
        </span>
        <span className={`expiry-badge ${isExpired ? "expired" : "active"}`}>{expiryText}</span>
      </div>

      <p>{course.courseDescription}</p>

      <div className="course-meta">
        <span>
          Instructor:{" "}
          <strong
            className="instructor-tag"
            style={{ backgroundColor: getInstructorColor(course.instructor) }}
          >
            {course.instructor}
          </strong>
        </span>
        <span>Read time: {getReadTime(course.courseDescription)}</span>
        <span>Created: {createdDate}</span>
      </div>

      {(onEdit || onDelete) && (
        <div className="course-actions">
          {onEdit && (
            <button
              type="button"
              className="edit-btn"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(course);
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="delete-btn"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(course._id);
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default CourseCard;