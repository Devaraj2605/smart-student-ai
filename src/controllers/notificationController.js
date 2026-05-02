const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const notificationAppliesToUser = (notification, userId, role) => {
  const targetUserId = notification.userId?.toString();
  if (targetUserId && targetUserId === userId) {
    return true;
  }
  if (notification.role && notification.role === role) {
    return true;
  }
  return false;
};

const createNotification = async (req, res) => {
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

    const { title, message, userId, role } = req.body;

    if (userId && role) {
      return res.status(400).json({
        message: "Provide either userId or role, not both",
      });
    }

    if (!userId && !role) {
      return res.status(400).json({
        message: "Provide userId or role to target recipients",
      });
    }

    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const notification = await Notification.create({
        title: title.trim(),
        message: message.trim(),
        userId,
      });

      return res.status(201).json(notification);
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      role,
    });

    return res.status(201).json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const notifications = await Notification.find({
      $or: [
        { userId: new mongoose.Types.ObjectId(userId) }, // ✅ FIX
        { role: role },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name");

    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (!notificationAppliesToUser(notification, userId, role)) {
      return res.status(403).json({
        message: "Forbidden: this notification is not for you",
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
};