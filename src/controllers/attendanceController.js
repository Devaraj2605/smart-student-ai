const mongoose = require("mongoose");
const Attendance = require("../models/attendanceModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canViewAttendance = (req, studentId) => {
  const role = req.user?.role;
  const requesterId = req.user?.userId;

  // Admin and teacher can view any student's attendance.
  if (role === "admin" || role === "teacher") {
    return true;
  }

  // Student/user can only view their own attendance.
  return requesterId === studentId;
};

const markAttendance = async (req, res) => {
  try {
    const { studentId, subject, status, date } = req.body;

    if (!studentId || !subject || !status) {
      return res.status(400).json({
        message: "Please provide studentId, subject, and status",
      });
    }

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const attendance = await Attendance.create({
      studentId,
      subject,
      status,
      date,
      markedBy: req.user?.userId,
    });

    return res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!canViewAttendance(req, studentId)) {
      return res.status(403).json({ message: "Forbidden: access denied" });
    }

    const attendanceRecords = await Attendance.find({ studentId })
      .sort({ date: -1, createdAt: -1 })
      .populate("studentId", "name email role")
      .populate("markedBy", "name email role");

    if (!attendanceRecords.length) {
      return res.status(200).json({
        message: "No attendance records found",
        attendance: [],
      });
    }

    return res.status(200).json({
      count: attendanceRecords.length,
      attendance: attendanceRecords,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAttendancePercentage = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!canViewAttendance(req, studentId)) {
      return res.status(403).json({ message: "Forbidden: access denied" });
    }

    const attendanceRecords = await Attendance.find({ studentId }).select("status");

    if (!attendanceRecords.length) {
      return res.status(200).json({
        message: "No attendance records found",
        total: 0,
        present: 0,
        percentage: 0,
      });
    }

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length;
    const percentage = Number(((present / total) * 100).toFixed(2));

    return res.status(200).json({
      total,
      present,
      percentage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getAttendancePercentage,
};
