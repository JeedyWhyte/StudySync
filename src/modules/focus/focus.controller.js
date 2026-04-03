const focusService = require('./focus.service');
const { success } = require('../../utils/response');

// POST /api/focus/start
const startSession = async (req, res, next) => {
    try {
        // body can optionally include { durationMins: 30 }
        // if not provided, service defaults to 45 minutes
        const data = await focusService.startSession(req.user.userId, req.body);
        return success(res, data, 'Focus session started');
    } catch (err) {
        next(err);
    }
};

// POST /api/focus/end
const endSession = async (req, res, next) => {
    try {
        const data = await focusService.endSession(req.user.userId);
        return success(res, data, 'Focus session ended');
    } catch (err) {
        next(err);
    }
};

// GET /api/focus/status
const getStatus = async (req, res, next) => {
    try {
        const data = await focusService.getStatus(req.user.userId);
        return success(res, data, 'Focus status retrieved');
    } catch (err) {
        next(err);
    }
};

module.exports = { startSession, endSession, getStatus };