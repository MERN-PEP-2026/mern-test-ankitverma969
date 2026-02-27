const normalizeText = (value = "") => value.toLowerCase().trim();

const isSubsequenceMatch = (query, target) => {
  if (!query) {
    return true;
  }

  let queryIndex = 0;
  for (let targetIndex = 0; targetIndex < target.length; targetIndex += 1) {
    if (target[targetIndex] === query[queryIndex]) {
      queryIndex += 1;
    }
    if (queryIndex === query.length) {
      return true;
    }
  }
  return false;
};

const fuzzyMatch = (query, course) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }

  const haystack = `${course.courseName} ${course.courseDescription} ${course.instructor}`.toLowerCase();
  return haystack.includes(normalizedQuery) || isSubsequenceMatch(normalizedQuery, haystack);
};

const isCourseExpired = (course) => {
  if (!course.validTill) {
    return false;
  }
  const now = new Date();
  const deadline = new Date(course.validTill);
  deadline.setHours(23, 59, 59, 999);
  return deadline < now;
};

const sortCourses = (courses) => {
  return [...courses].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const aExpired = isCourseExpired(a);
    const bExpired = isCourseExpired(b);
    if (aExpired !== bExpired) {
      return aExpired ? 1 : -1;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

const getLatestCourses = (courses, limit = 3) => {
  return [...courses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

export { fuzzyMatch, isCourseExpired, sortCourses, getLatestCourses };