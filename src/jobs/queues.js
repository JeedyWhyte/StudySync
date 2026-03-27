const { Queue } = require('bullmq');
const { client } = require('../config/redis');

//  CONNECTION CONFIG 

// BullMQ needs its own connection config — it cannot share the main Redis client
const connection = {
    host: new URL(process.env.REDIS_URL).hostname,
    port: new URL(process.env.REDIS_URL).port,
};

//  QUEUES 

// Handles AI learning path generation jobs
// Enqueued when a learner completes onboarding
const pathGenerationQueue = new Queue('pathGeneration', { connection });

// Handles email notification jobs
// Enqueued when course is approved, rejected, or student completes a course
const notificationQueue = new Queue('notification', { connection });

//  HELPERS 

// Adds a path generation job to the queue
// Called from onboarding.service.js after learner submits onboarding
const addPathGenerationJob = async (userId, learnerProfile) => {
    await pathGenerationQueue.add(
        'generatePath',
        { userId, learnerProfile },
        {
            attempts: 3,        // retry up to 3 times if the job fails
            backoff: {
                type: 'exponential',
                delay: 5000     // wait 5s, then 10s, then 20s between retries
            }
        }
    );
};

// Adds a notification job to the queue
// Called from notifications.service.js
const addNotificationJob = async (type, payload) => {
    await notificationQueue.add(
        type,
        payload,
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 3000
            }
        }
    );
};

module.exports = {
    pathGenerationQueue,
    notificationQueue,
    addPathGenerationJob,
    addNotificationJob
};