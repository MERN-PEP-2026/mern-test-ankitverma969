import { useEffect, useMemo, useState } from "react";

const MAX_DESCRIPTION_LENGTH = 220;
const COURSE_DRAFT_KEY = "courseDraft";

const getInitialFormData = () => {
  const fallback = {
    courseName: "",
    courseDescription: "",
    instructor: "",
    validTill: ""
  };

  try {
    const rawDraft = localStorage.getItem(COURSE_DRAFT_KEY);
    return rawDraft ? { ...fallback, ...JSON.parse(rawDraft) } : fallback;
  } catch {
    return fallback;
  }
};

const CourseForm = ({ onSubmit, isSubmitting, courseNameInputRef }) => {
  const [formData, setFormData] = useState(getInitialFormData);

  const remainingChars = useMemo(
    () => MAX_DESCRIPTION_LENGTH - formData.courseDescription.length,
    [formData.courseDescription.length]
  );

  const estimatedReadTime = useMemo(() => {
    const words = formData.courseDescription.trim().split(/\s+/).filter(Boolean).length;
    if (!words) {
      return 0;
    }
    return Math.max(1, Math.ceil(words / 200));
  }, [formData.courseDescription]);

  useEffect(() => {
    localStorage.setItem(COURSE_DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "courseDescription" && value.length > MAX_DESCRIPTION_LENGTH) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...formData,
      validTill: formData.validTill || null
    });
    const resetData = {
      courseName: "",
      courseDescription: "",
      instructor: "",
      validTill: ""
    };
    setFormData(resetData);
    localStorage.removeItem(COURSE_DRAFT_KEY);
  };

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <h2>
        <span className="heading-icon">+</span>
        Create Course
      </h2>

      <input
        ref={courseNameInputRef}
        type="text"
        name="courseName"
        value={formData.courseName}
        onChange={handleChange}
        placeholder="Course name"
        required
      />

      <textarea
        name="courseDescription"
        value={formData.courseDescription}
        onChange={handleChange}
        placeholder="Course description"
        rows="4"
        required
      />
      <div className="form-meta-row">
        <div className="char-counter">{remainingChars} characters left</div>
        <div className="read-time-preview">
          Estimated reading time: {estimatedReadTime ? `${estimatedReadTime} min` : "-"}
        </div>
      </div>

      <input
        type="text"
        name="instructor"
        value={formData.instructor}
        onChange={handleChange}
        placeholder="Instructor"
        required
      />

      <input
        type="date"
        name="validTill"
        value={formData.validTill}
        onChange={handleChange}
        min={new Date().toISOString().slice(0, 10)}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
};

export default CourseForm;