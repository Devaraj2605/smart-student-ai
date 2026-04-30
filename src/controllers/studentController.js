const Student = require("../models/studentModel");
const { validationResult } = require("express-validator");

const createStudent = async (req, res) => {
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

    const { name, age, course } = req.body;

    const student = await Student.create({ name, age, course });
    return res.status(201).json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudents = async (_req, res) => {
  try {
    const students = await Student.find();
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    // CastError is common for invalid ObjectId format
    if (error?.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
};

