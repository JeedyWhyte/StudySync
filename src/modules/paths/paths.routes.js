const express = require('express');
const router = express.Router();

const pathsController = require('./paths.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// ─── ALL PATHS ROUTES ARE LEARNER ONLY ───────────────────────────────────────

// Get my AI generated learning path
// Returns status: 'generating' | 'ready' | 'failed'
router.get(
    '/',
    authenticate,
    requireRole('learner'),
    pathsController.getLearnerPath
);

// Mark a stage as complete — unlocks the next stage automatically
router.patch(
    '/stage/:stageId',
    authenticate,
    requireRole('learner'),
    pathsController.completeStage
);

// Retry path generation if it failed
router.post(
    '/retry',
    authenticate,
    requireRole('learner'),
    pathsController.retryPathGeneration
);

module.exports = router;