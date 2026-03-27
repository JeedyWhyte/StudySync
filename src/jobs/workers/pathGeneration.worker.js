const { Worker } = require('bullmq');
const { generateLearningPath } = require('../../modules/paths/ai.service');
const Path = require('../../models/path.model');

// ─── CONNECTION CONFIG ────────────────────────────────────────────────────────

const connection = {
    host: new URL(process.env.REDIS_URL).hostname,
    port: new URL(process.env.REDIS_URL).port,
};

// ─── WORKER ───────────────────────────────────────────────────────────────────

const pathGenerationWorker = new Worker(
    'pathGeneration',   // must match the queue name in queues.js exactly
    async (job) => {
        const { userId, learnerProfile } = job.data;

        console.log(`Processing path generation job for user: ${userId}`);

        // Step 1 — Call Claude API to generate the learning path
        const aiResult = await generateLearningPath(learnerProfile);

        // Step 2 — Calculate deadlines for each stage
        // Each stage deadline is based on its estimated weeks from today
        let cumulativeWeeks = 0;
        const stages = aiResult.stages.map((stage) => {
            cumulativeWeeks += stage.estimatedWeeks;
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + cumulativeWeeks * 7);

            return {
                order: stage.order,
                title: stage.title,
                description: stage.description,
                estimatedWeeks: stage.estimatedWeeks,
                hoursRequired: stage.hoursRequired,
                status: stage.order === 1 ? 'active' : 'locked',
                deadline
            };
        });

        // Step 3 — Save the generated path to MongoDB
        await Path.findOneAndUpdate(
            { userId },
            {
                status: 'ready',
                estimatedWeeks: aiResult.estimatedWeeks,
                weeklyHours: aiResult.weeklyHours,
                summary: aiResult.summary,
                stages,
                generatedAt: new Date()
            },
            { new: true }
        );

        console.log(`✅ Path generation complete for user: ${userId}`);
    },
    { connection }
);

// ─── EVENT HANDLERS ───────────────────────────────────────────────────────────

// Job completed successfully
pathGenerationWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

// Job failed after all retries exhausted
pathGenerationWorker.on('failed', async (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);

    // Mark the path as failed in MongoDB so frontend can show retry option
    await Path.findOneAndUpdate(
        { userId: job.data.userId },
        { status: 'failed' }
    );
});

module.exports = pathGenerationWorker;