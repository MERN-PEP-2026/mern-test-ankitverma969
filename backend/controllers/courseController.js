const Course = require("../models/Course");

const createCourse = async (req, res, next) => {
  try {
    const { courseName, courseDescription, instructor, validTill } = req.body;

    if (!courseName || !courseDescription || !instructor) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const course = await Course.create({
      courseName,
      courseDescription,
      instructor,
      validTill: validTill || null
    });

    res.status(201).json({
      message: "Course created successfully",
      course
    });
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const { search = "", instructor = "", pinned = "", status = "" } = req.query;
    const andConditions = [];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      andConditions.push({
        $or: [{ courseName: searchRegex }, { courseDescription: searchRegex }, { instructor: searchRegex }]
      });
    }

    if (instructor) {
      andConditions.push({ instructor: new RegExp(`^${instructor}$`, "i") });
    }

    if (pinned === "true") {
      andConditions.push({ isPinned: true });
    } else if (pinned === "false") {
      andConditions.push({ isPinned: false });
    }

    if (status === "active") {
      andConditions.push({ $or: [{ validTill: null }, { validTill: { $gte: new Date() } }] });
    } else if (status === "expired") {
      andConditions.push({ validTill: { $ne: null, $lt: new Date() } });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseName, courseDescription, instructor, validTill } = req.body;

    const updates = {
      courseName,
      courseDescription,
      instructor,
      validTill: validTill || null
    };

    const updatedCourse = await Course.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      message: "Course updated successfully",
      course: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

const togglePinCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.isPinned = !course.isPinned;
    await course.save();

    res.json({
      message: course.isPinned ? "Course pinned" : "Course unpinned",
      course
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getCourses,
  updateCourse,
  togglePinCourse,
  deleteCourse
};