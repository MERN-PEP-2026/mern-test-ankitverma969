const express = require("express");
const {
  createCourse,
  getCourses,
  updateCourse,
  togglePinCourse,
  deleteCourse
} = require("../controllers/courseController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createCourse);
router.get("/", protect, getCourses);
router.put("/:id", protect, updateCourse);
router.patch("/:id/pin", protect, togglePinCourse);
router.delete("/:id", protect, deleteCourse);

module.exports = router;