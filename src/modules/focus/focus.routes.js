const express = require('express');
const router = express.Router();

const focusController = require('./focus.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// All focus routes are learner-only.
// A lecturer hitting these gets a 403 — focus mode is a learner feature.

// POST /api/focus/start
router.post(
    '/start',
    authenticate,
    requireRole('learner'),
    focusController.startSession
);

// POST /api/focus/end
router.post(
    '/end',
    authenticate,
    requireRole('learner'),
    focusController.endSession
);

// GET /api/focus/status
router.get(
    '/status',
    authenticate,
    requireRole('learner'),
    focusController.getStatus
);

module.exports = router;