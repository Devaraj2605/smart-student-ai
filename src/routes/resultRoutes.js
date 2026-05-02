const express = require("express");
const { body } = require("express-validator");
const {
  addResult,
  getStudentResults,
  getMyResults,
} = require("../controllers/resultController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const addResultValidation = [
  body("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid student ID"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("marks")
    .isFloat({ min: 0 })
    .withMessage("Marks must be a number greater than or equal to 0"),
  body("examType").trim().notEmpty().withMessage("Exam type is required"),
];

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  addResultValidation,
  addResult
);

router.get("/my", authMiddleware, getMyResults);

router.get("/:studentId", authMiddleware, getStudentResults);

module.exports = router;
