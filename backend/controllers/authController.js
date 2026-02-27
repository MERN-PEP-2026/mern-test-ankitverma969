const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { writeActivityLog } = require("../services/activityLogService");

const createToken = (studentId) => {
  return jwt.sign({ id: studentId }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
};

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword
    });

    const token = createToken(student._id);
    try {
      await writeActivityLog({
        studentId: student._id,
        action: "AUTH_REGISTER_SUCCESS",
        req,
        statusCode: 201,
        latencyMs: 0
      });
    } catch (loggingError) {
      console.error("Registration activity logging failed:", loggingError.message);
    }

    res.status(201).json({
      message: "Registration successful",
      token
    });
  } catch (error) {
    next(error);
  }
};

const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(student._id);
    try {
      await writeActivityLog({
        studentId: student._id,
        action: "AUTH_LOGIN_SUCCESS",
        req,
        statusCode: 200,
        latencyMs: 0
      });
    } catch (loggingError) {
      console.error("Login activity logging failed:", loggingError.message);
    }

    res.json({
      message: "Login successful",
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginStudent
};
