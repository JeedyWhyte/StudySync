const express = require('express');
const router  = express.Router();

const coursesController             = require('./courses.controller');
const learnerController             = require('../learner/learner.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// CRITICAL: /search must stay above /:id
router.get(
    '/search',
    authenticate,
    requireRole('learner'),
    coursesController.searchCourses
);

// GET /api/courses/:id
router.get(
    '/:id',
    authenticate,
    requireRole('learner'),
    coursesController.getCourseById
);

// GET /api/courses
router.get(
    '/',
    authenticate,
    requireRole('learner'),
    coursesController.getCourses
);

// POST /api/courses/:id/enroll  ← moved here so the mount path is correct
router.post(
    '/:id/enroll',
    authenticate,
    requireRole('learner'),
    learnerController.enrollInCourse
);

module.exports = router;