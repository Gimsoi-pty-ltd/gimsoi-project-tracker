import prisma from "../lib/prisma.js";

// 1. Get all notifications for the logged-in user
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// 2. Mark a specific notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await prisma.notification.updateMany({
      where: { id: id, userId: req.user.id },
      data: { isRead: true },
    });
    if (result.count === 0) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};

// 3. Mark ALL notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// 4. Helper function to create a notification (to be used in other controllers)
export const createNotification = async (userId, title, message, type = "INFO") => {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};