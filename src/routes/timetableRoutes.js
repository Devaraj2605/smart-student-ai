const express = require("express");
const {
  createTimetable,
  updateTimetable,
  getTimetable,
} = require("../controllers/timetableController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  createTimetable
);
router.put("/:id", authMiddleware, updateTimetable);
router.get("/", getTimetable);

module.exports = router;
