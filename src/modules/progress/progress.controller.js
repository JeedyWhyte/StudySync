const progressService = require('./progress.service');
const { success } = require('../../utils/response');

// POST /api/learner/progress/log
const logProgress = async (req, res, next) => {
    try {
        const data = await progressService.logProgress(req.user.userId, req.body);
        return success(res, data, 'Progress logged');
    } catch (err) {
        next(err);
    }
};

// GET /api/learner/progress
const getFullProgress = async (req, res, next) => {
    try {
        const data = await progressService.getFullProgress(req.user.userId);
        return success(res, data, 'Progress retrieved');
    } catch (err) {
        next(err);
    }
};

// GET /api/learner/progress/streak
const getStreak = async (req, res, next) => {
    try {
        const data = await progressService.getStreak(req.user.userId);
        return success(res, data, 'Streak retrieved');
    } catch (err) {
        next(err);
    }
};

// GET /api/learner/progress/:courseId
const getCourseProgress = async (req, res, next) => {
    try {
        const data = await progressService.getCourseProgress(
            req.user.userId,
            req.params.courseId
        );
        return success(res, data, 'Course progress retrieved');
    } catch (err) {
        next(err);
    }
};

module.exports = { logProgress, getFullProgress, getStreak, getCourseProgress };