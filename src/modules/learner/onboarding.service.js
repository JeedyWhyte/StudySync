const User = require('../../models/user.model');
const Path = require('../../models/path.model');
const { addPathGenerationJob } = require('../../jobs/queues');

const onboard = async (userId, body) => {
    const { course, learningIntent, currentLevel, schedule } = body;

    // Step 1 — Find the learner
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.status = 404; err.code = 'NOT_FOUND';
        throw err;
    }

    // Step 2 — Prevent re-onboarding
    // Once a learner has submitted onboarding, they should not be able to
    // overwrite it. This protects the AI path that was already generated.
    if (user.onboarding.complete) {
        const err = new Error('Onboarding already completed');
        err.status = 400; err.code = 'BAD_REQUEST';
        throw err;
    }

    // Step 3 — Save onboarding data to the user document
    // We use Object.assign on the nested object so Mongoose detects the change
    user.onboarding = {
        course,
        learningIntent,
        currentLevel,
        schedule,
        complete: true   // mark as done so they can't re-submit
    };
    await user.save();

    // Step 4 — Create a Path document with status 'generating'
    // This is the placeholder the frontend polls while Claude is working.
    // We use upsert (findOneAndUpdate with upsert:true) in case of retries.
    await Path.findOneAndUpdate(
        { userId },
        { userId, status: 'generating' },
        { upsert: true, new: true }
    );

    // Step 5 — Enqueue the AI path generation job
    // We pass the full onboarding object because the worker needs
    // course, currentLevel, schedule, etc. to build the Claude prompt.
    await addPathGenerationJob(userId, user.onboarding);

    // Step 6 — Return immediately (202 pattern — never wait for Claude)
    return { status: 'generating' };
};

module.exports = { onboard };