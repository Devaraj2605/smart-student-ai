const express = require("express");
const { body } = require("express-validator");
const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Protect all student CRUD routes
router.use(authMiddleware);

const studentValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("age")
    .isInt({ gt: 0 })
    .withMessage("Age must be a positive integer"),
  body("course").trim().notEmpty().withMessage("Course is required"),
];

router.post("/", roleMiddleware(["admin"]), studentValidationRules, createStudent);
router.get("/", getStudents);
router.put("/:id", roleMiddleware(["admin"]), updateStudent);
router.delete("/:id", roleMiddleware(["admin"]), deleteStudent);

module.exports = router;
