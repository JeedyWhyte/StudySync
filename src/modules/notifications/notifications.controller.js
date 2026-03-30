const notificationsService = require('./notifications.service');
const { success } = require('../../utils/response');

// GET MY NOTIFICATIONS
const getNotifications = async (req, res, next) => {
    try {
        // Pass query params so the service can handle pagination
        const data = await notificationsService.getNotifications(
            req.user.userId,
            req.query
        );
        return success(res, data, 'Notifications retrieved');
    } catch (err) {
        next(err);
    }
};

// MARK ONE AS READ
const markAsRead = async (req, res, next) => {
    try {
        const data = await notificationsService.markAsRead(
            req.user.userId,
            req.params.id
        );
        return success(res, data, 'Notification marked as read');
    } catch (err) {
        next(err);
    }
};

// MARK ALL AS READ
const markAllAsRead = async (req, res, next) => {
    try {
        const data = await notificationsService.markAllAsRead(req.user.userId);
        return success(res, data, 'All notifications marked as read');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};