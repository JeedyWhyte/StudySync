// src/modules/progress/progress.routes.js

const express = require('express');
const router = express.Router();

const progressController = require('./progress.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// POST /api/learner/progress/log
router.post(
    '/log',
    authenticate,
    requireRole('learner'),
    progressController.logProgress
);

// CRITICAL: /streak must be declared BEFORE /:courseId
// Otherwise Express matches "streak" as a courseId parameter
router.get(
    '/streak',
    authenticate,
    requireRole('learner'),
    progressController.getStreak
);

// GET /api/learner/progress/:courseId
router.get(
    '/:courseId',
    authenticate,
    requireRole('learner'),
    progressController.getCourseProgress
);

// GET /api/learner/progress
router.get(
    '/',
    authenticate,
    requireRole('learner'),
    progressController.getFullProgress
);

module.exports = router;