const Notification = require("../models/notificationModel");

// Create notification
const createNotification = async (req, res) => {
  try {
    const { title, message, userId, role } = req.body;

    const notification = await Notification.create({
      title,
      message,
      userId: userId || null,
      role: role || null,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const notifications = await Notification.find({
      $or: [
        { userId: userId },
        { role: role },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
};