const express = require("express");
const { body } = require("express-validator");
const {
  createNotification,
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const createNotificationValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID"),
  body("role")
    .optional()
    .isIn(["user", "teacher", "admin"])
    .withMessage("role must be one of: user, teacher, admin"),
];

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  createNotificationValidation,
  createNotification
);

router.get("/", authMiddleware, getNotifications);

router.put("/:id/read", authMiddleware, markAsRead);

module.exports = router;
