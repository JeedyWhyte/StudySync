const express = require('express');
const router  = express.Router();

const learnerController         = require('./learner.controller');
const { authenticate, requireRole } = require('../../middleware/auth');
const { imageUpload } = require('../../middleware/upload.middleware');

// All learner routes require authentication + learner role.
// A lecturer or admin hitting these endpoints gets a 403 Forbidden.

// POST /api/learner/onboard
router.post(
    '/onboard',
    authenticate,
    requireRole('learner'),
    learnerController.onboard
);

// GET /api/learner/profile
router.get(
    '/profile',
    authenticate,
    requireRole('learner'),
    learnerController.getProfile
);

// PATCH /api/learner/profile
router.patch(
    '/profile',
    authenticate,
    requireRole('learner'),
    learnerController.updateProfile
);

// PATCH /api/learner/profile/avatar
router.patch(
    '/profile/avatar',
    authenticate,
    requireRole('learner'),
    imageUpload.single('avatar'),
    learnerController.uploadAvatar
);

// GET /api/learner/enrollments
router.get(
    '/enrollments',
    authenticate,
    requireRole('learner'),
    learnerController.getMyEnrollments
);

module.exports = router;