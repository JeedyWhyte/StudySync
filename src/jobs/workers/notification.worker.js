const { Worker } = require('bullmq');
const { sendEmail } = require('../../utils/email');
const Notification = require('../../models/notification.model');
const User = require('../../models/user.model');
const Course = require('../../models/course.model');

// CONNECTION CONFIG 

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

//  EMAIL TEMPLATES 

const templates = {
    course_approved: (courseName) => ({
        subject: `Your course "${courseName}" has been approved`,
        html: `
            <h2>Great news!</h2>
            <p>Your course <strong>${courseName}</strong> has been approved 
            and is now visible to learners on StudySync.</p>
            <p>Log in to your dashboard to see your enrolled students.</p>
        `
    }),

    course_rejected: (courseName, reason) => ({
        subject: `Your course "${courseName}" needs some changes`,
        html: `
            <h2>Course Review Update</h2>
            <p>Your course <strong>${courseName}</strong> was not approved 
            for the following reason:</p>
            <blockquote>${reason}</blockquote>
            <p>Please make the necessary changes and resubmit.</p>
        `
    }),

    student_completed: (studentName, courseName) => ({
        subject: `${studentName} completed your course "${courseName}"`,
        html: `
            <h2>Course Completion</h2>
            <p><strong>${studentName}</strong> has completed your course 
            <strong>${courseName}</strong>.</p>
            <p>Log in to your dashboard to view their progress.</p>
        `
    }),

    deadline_reminder: (stageName, deadline) => ({
        subject: `Reminder: "${stageName}" deadline is approaching`,
        html: `
            <h2>Learning Path Reminder</h2>
            <p>Your stage <strong>${stageName}</strong> is due on 
            <strong>${new Date(deadline).toDateString()}</strong>.</p>
            <p>Log in to StudySync to continue your learning path.</p>
        `
    })
};

// WORKER 

const notificationWorker = new Worker(
    'notification',
    async (job) => {
        const { type, userId, meta } = job.data;

        console.log(`Processing notification job: ${type} for user: ${userId}`);

        // Step 1 — Get the user who receives the notification
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User ${userId} not found`);
        }

        // Step 2 — Build the email content based on notification type
        let emailContent;
        let notificationTitle;
        let notificationMessage;

        if (type === 'course_approved') {
            const course = await Course.findById(meta.courseId);
            emailContent = templates.course_approved(course.title);
            notificationTitle = 'Course Approved';
            notificationMessage = `Your course "${course.title}" has been approved`;

        } else if (type === 'course_rejected') {
            const course = await Course.findById(meta.courseId);
            emailContent = templates.course_rejected(course.title, meta.reason);
            notificationTitle = 'Course Needs Changes';
            notificationMessage = `Your course "${course.title}" was not approved: ${meta.reason}`;

        } else if (type === 'student_completed') {
            const course = await Course.findById(meta.courseId);
            const student = await User.findById(meta.studentId);
            emailContent = templates.student_completed(student.name, course.title);
            notificationTitle = 'Student Completed Course';
            notificationMessage = `${student.name} completed "${course.title}"`;

        } else if (type === 'deadline_reminder') {
            emailContent = templates.deadline_reminder(meta.stageName, meta.deadline);
            notificationTitle = 'Deadline Reminder';
            notificationMessage = `Your stage "${meta.stageName}" deadline is approaching`;
        }

        // Step 3 — Save in-app notification to MongoDB
        await Notification.create({
            userId,
            type,
            title: notificationTitle,
            message: notificationMessage,
            meta
        });

        // Step 4 — Send email notification via Resend
        await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html
        });

        console.log(`✅ Notification sent: ${type} to ${user.email}`);
    },
    { connection }
);

// EVENT HANDLERS 

notificationWorker.on('completed', (job) => {
    console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
    console.error(`Notification job ${job.id} failed: ${err.message}`);
});

module.exports = notificationWorker;
