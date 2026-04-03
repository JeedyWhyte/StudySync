const express = require('express');
const router = express.Router();

const notificationsController = require('./notifications.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// GET all my notifications (paginated)
router.get(
    '/',
    authenticate,
    notificationsController.getNotifications
);

// MARK one notification as read
router.patch(
    '/:id/read',
    authenticate,
    notificationsController.markAsRead
);

// MARK all notifications as read
router.patch(
    '/read-all',
    authenticate,
    notificationsController.markAllAsRead
);

module.exports = router;