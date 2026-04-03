const { Queue } = require('bullmq');

const redisUrl = new URL(process.env.REDIS_URL);
const isSecure = process.env.REDIS_URL.startsWith('rediss://');

const connection = {
    host: redisUrl.hostname,
    port: redisUrl.port,
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    tls: isSecure ? {} : undefined,
    enableOfflineQueue: false,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true
};

const pathGenerationQueue = new Queue('pathGeneration', { connection });
const notificationQueue = new Queue('notification', { connection });

const addPathGenerationJob = async (userId, learnerProfile) => {
    await pathGenerationQueue.add(
        'generatePath',
        { userId, learnerProfile },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        }
    );
};

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