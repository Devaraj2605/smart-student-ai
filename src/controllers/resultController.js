const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Result = require("../models/resultModel");
const User = require("../models/userModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canViewStudentResults = (req, studentId) => {
  const role = req.user?.role;
  const requesterId = req.user?.userId;

  if (role === "admin" || role === "teacher") {
    return true;
  }

  return requesterId === studentId;
};

const addResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }

    const { studentId, subject, marks, examType } = req.body;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const result = await Result.create({
      studentId,
      subject: subject.trim(),
      marks,
      examType: examType.trim(),
    });

    const populated = await Result.findById(result._id).populate(
      "studentId",
      "name email role"
    );

    return res.status(201).json(populated);
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!canViewStudentResults(req, studentId)) {
      return res.status(403).json({ message: "Forbidden: access denied" });
    }

    const results = await Result.find({ studentId })
      .sort({ createdAt: -1 })
      .populate("studentId", "name email role");

    return res.status(200).json(results);
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getMyResults = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user context missing" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const results = await Result.find({ studentId: userId })
      .sort({ createdAt: -1 })
      .populate("studentId", "name email role");

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addResult,
  getStudentResults,
  getMyResults,
};
