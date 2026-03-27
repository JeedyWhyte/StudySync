const Path = require('../../models/path.model');
const User = require('../../models/user.model');
const { addPathGenerationJob } = require('../../jobs/queues');

//  GET LEARNER PATH 

const getLearnerPath = async (userId) => {
    // Find the path document for this learner
    const path = await Path.findOne({ userId })
        .populate('stages.courseId', 'title level category');

    // If no path exists yet, the learner hasn't completed onboarding
    if (!path) {
        const err = new Error('No learning path found. Please complete onboarding first.');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    return path;
};

//  MARK STAGE COMPLETE 

const completeStage = async (userId, stageId) => {
    // Find the learner's path
    const path = await Path.findOne({ userId });

    if (!path) {
        const err = new Error('Learning path not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Find the specific stage the learner is completing
    const stage = path.stages.id(stageId);

    if (!stage) {
        const err = new Error('Stage not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Only active stages can be marked complete
    // Locked stages haven't been unlocked yet
    if (stage.status !== 'active') {
        const err = new Error('This stage is not active yet');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // Mark this stage as completed
    stage.status = 'completed';

    // Find the next stage and unlock it
    // Stages are ordered by the order field — next stage is current order + 1
    const nextStage = path.stages.find(s => s.order === stage.order + 1);
    if (nextStage) {
        nextStage.status = 'active';
    }

    // Save the updated path back to MongoDB
    await path.save();

    return path;
};

//  RETRY FAILED PATH 

const retryPathGeneration = async (userId) => {
    // Find the failed path
    const path = await Path.findOne({ userId });

    if (!path || path.status !== 'failed') {
        const err = new Error('No failed path found to retry');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // Get the learner profile to regenerate the path
    const user = await User.findById(userId);

    if (!user || !user.onboarding.complete) {
        const err = new Error('Onboarding data not found');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // Reset path status back to generating
    path.status = 'generating';
    await path.save();

    // Re-enqueue the job
    await addPathGenerationJob(userId, user.onboarding);

    return { status: 'generating' };
};

module.exports = {
    getLearnerPath,
    completeStage,
    retryPathGeneration
};