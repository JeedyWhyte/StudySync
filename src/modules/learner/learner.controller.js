// src/modules/learner/learner.controller.js

const onboardingService = require('./onboarding.service');
const learnerService    = require('./learner.service');
const { success, error } = require('../../utils/response');

// POST /api/learner/onboard
const onboard = async (req, res, next) => {
    try {
        const data = await onboardingService.onboard(req.user.userId, req.body);
        // 202 Accepted — we received the request but the AI is still working.
        // This is intentional: never block on a Claude API call.
        return success(res, data, 'Onboarding received. Your learning path is being generated.', 202);
    } catch (err) {
        next(err);
    }
};

// GET /api/learner/profile
const getProfile = async (req, res, next) => {
    try {
        const data = await learnerService.getProfile(req.user.userId);
        return success(res, data, 'Profile retrieved');
    } catch (err) {
        next(err);
    }
};

// PATCH /api/learner/profile
const updateProfile = async (req, res, next) => {
    try {
        const data = await learnerService.updateProfile(req.user.userId, req.body);
        return success(res, data, 'Profile updated');
    } catch (err) {
        next(err);
    }
};

// POST /api/courses/:id/enroll
const enrollInCourse = async (req, res, next) => {
    try {
        const data = await learnerService.enrollInCourse(
            req.user.userId,
            req.params.id      // course ID from the URL
        );
        return success(res, data, 'Enrolled successfully', 201);
    } catch (err) {
        next(err);
    }
};

// GET /api/learner/enrollments
const getMyEnrollments = async (req, res, next) => {
    try {
        const data = await learnerService.getMyEnrollments(req.user.userId);
        return success(res, data, 'Enrollments retrieved');
    } catch (err) {
        next(err);
    }
};


module.exports = { onboard, getProfile, updateProfile, enrollInCourse, getMyEnrollments };