const express = require('express');
const router = express.Router();

const notificationsController = require('./notifications.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// GET all my notifications (paginated)
router.get(
    '/',
    authenticate,
    requireRole('lecturer'),
    notificationsController.getNotifications
);

// MARK one notification as read
router.patch(
    '/:id/read',
    authenticate,
    requireRole('lecturer'),
    notificationsController.markAsRead
);

// MARK all notifications as read
router.patch(
    '/read-all',
    authenticate,
    requireRole('lecturer'),
    notificationsController.markAllAsRead
);

module.exports = router;