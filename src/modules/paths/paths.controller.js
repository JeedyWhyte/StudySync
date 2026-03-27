const pathsService = require('./paths.service');
const { success, error } = require('../../utils/response');

//  GET LEARNER PATH 

const getLearnerPath = async (req, res, next) => {
    try {
        // req.user.userId comes from the authenticate middleware
        const path = await pathsService.getLearnerPath(req.user.userId);
        return success(res, path, 'Learning path retrieved');
    } catch (err) {
        next(err);
    }
};

//  MARK STAGE COMPLETE 

const completeStage = async (req, res, next) => {
    try {
        // stageId comes from the URL parameter — /path/stage/:stageId
        const path = await pathsService.completeStage(
            req.user.userId,
            req.params.stageId
        );
        return success(res, path, 'Stage marked as complete');
    } catch (err) {
        next(err);
    }
};

//  RETRY FAILED PATH 

const retryPathGeneration = async (req, res, next) => {
    try {
        const data = await pathsService.retryPathGeneration(req.user.userId);
        return success(res, data, 'Path generation restarted');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getLearnerPath,
    completeStage,
    retryPathGeneration
};