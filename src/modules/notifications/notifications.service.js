const Notification = require('../../models/notification.model');

// CREATE NOTIFICATION (helper)
// This is called internally by other services — not directly by a route
// It creates an in-app notification and optionally queues an email
const createNotification = async ({ userId, type, title, message, meta = {} }) => {
    const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        meta
    });

    return notification;
};

// GET MY NOTIFICATIONS
// Returns all notifications for the logged-in lecturer, newest first
// Paginated — defaults to page 1, 20 per page
const getNotifications = async (userId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Notification.countDocuments({ userId })
    ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// MARK ONE NOTIFICATION AS READ
const markAsRead = async (userId, notificationId) => {
    const notification = await Notification.findOne({
        _id: notificationId,
        userId  // ownership check — a lecturer can only mark their own notifications
    });

    if (!notification) {
        const err = new Error('Notification not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    notification.read = true;
    await notification.save();

    return notification;
};

// MARK ALL NOTIFICATIONS AS READ
const markAllAsRead = async (userId) => {
    await Notification.updateMany(
        { userId, read: false },
        { read: true }
    );

    return { message: 'All notifications marked as read' };
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};