const express = require("express");
const {
  markAttendance,
  getStudentAttendance,
  getAttendancePercentage,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  markAttendance
);

router.get("/:studentId", authMiddleware, getStudentAttendance);
router.get("/:studentId/percentage", authMiddleware, getAttendancePercentage);

module.exports = router;
