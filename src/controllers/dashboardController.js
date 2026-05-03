const mongoose = require("mongoose");
const Attendance = require("../models/attendanceModel");
const Result = require("../models/resultModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user context missing" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const [totalClasses, presentClasses, results] = await Promise.all([
      Attendance.countDocuments({ studentId: userId }),
      Attendance.countDocuments({ studentId: userId, status: "present" }),
      Result.find({ studentId: userId }).select("marks").lean(),
    ]);

    const percentage =
      totalClasses === 0
        ? 0
        : Number(((presentClasses / totalClasses) * 100).toFixed(2));

    const totalSubjects = results.length;
    const averageMarks =
      totalSubjects === 0
        ? 0
        : Number(
            (
              results.reduce((sum, r) => sum + (r.marks ?? 0), 0) / totalSubjects
            ).toFixed(2)
          );

    return res.status(200).json({
      attendance: {
        totalClasses,
        present: presentClasses,
        percentage,
      },
      results: {
        averageMarks,
        totalSubjects,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData,
};
