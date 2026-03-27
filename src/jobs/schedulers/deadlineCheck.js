const cron = require('node-cron');
const Path = require('../../models/path.model');
const { addNotificationJob } = require('../queues');

// DEADLINE CHECK 

// Runs once every day at midnight (WAT — West Africa Time)
// Scans all active learning path stages for upcoming deadlines
// Fires a reminder notification for any stage due within 48 hours

const startDeadlineCheck = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily deadline check...');

        try {
            const now = new Date();

            // 48 hours from now
            const fortyEightHoursFromNow = new Date(
                now.getTime() + 48 * 60 * 60 * 1000
            );

            // Find all learning paths that have at least one active stage
            // with a deadline falling within the next 48 hours
            const paths = await Path.find({
                'stages': {
                    $elemMatch: {
                        status: 'active',
                        deadline: {
                            $gte: now,
                            $lte: fortyEightHoursFromNow
                        }
                    }
                }
            }).populate('userId', 'name email');

            console.log(`Found ${paths.length} paths with upcoming deadlines`);

            // Fire a notification job for each matching stage
            for (const path of paths) {
                // Find the specific active stage within the deadline window
                const urgentStage = path.stages.find(stage =>
                    stage.status === 'active' &&
                    stage.deadline >= now &&
                    stage.deadline <= fortyEightHoursFromNow
                );

                if (urgentStage) {
                    await addNotificationJob('deadline_reminder', {
                        userId: path.userId._id,
                        meta: {
                            stageName: urgentStage.title,
                            deadline: urgentStage.deadline
                        }
                    });

                    console.log(`⏰ Deadline reminder queued for user: ${path.userId.email}`);
                }
            }

            console.log('✅ Daily deadline check complete');

        } catch (err) {
            console.error('Deadline check failed:', err.message);
        }
    }, {
        timezone: 'Africa/Lagos'  // WAT — West Africa Time
    });

    console.log('📅 Deadline check scheduler started');
};

module.exports = { startDeadlineCheck };