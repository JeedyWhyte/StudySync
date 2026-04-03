// src/modules/progress/progress.service.js

const Progress = require('../../models/progress.model');
const Course = require('../../models/course.model');
const Enrollment = require('../../models/enrollment.model');

// ─── STREAK HELPER ────────────────────────────────────────────────────────────
// Converts a UTC date to WAT (UTC+1) and returns just the date portion
// as a string like "2026-04-02". This lets us compare days correctly
// for Nigerian learners regardless of what time zone the server runs in.
const toWATDateString = (date) => {
    const WAT_OFFSET_MS = 60 * 60 * 1000; // UTC+1 in milliseconds
    const watDate = new Date(date.getTime() + WAT_OFFSET_MS);
    return watDate.toISOString().split('T')[0]; // "2026-04-02"
};

// ─── LOG A COMPLETED MODULE ───────────────────────────────────────────────────
// Called when a learner finishes watching/reading a module.
// Does three things:
//   1. Adds the moduleId to completedModules (if not already there)
//   2. Recomputes percentComplete based on total modules in the course
//   3. Updates streak logic using WAT dates
const logProgress = async (userId, body) => {
    const { courseId, moduleId } = body;

    // Confirm the learner is actually enrolled before logging progress.
    // We never want ghost progress records for courses they didn't enroll in.
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId
    });
    if (!enrollment) {
        const err = new Error('You are not enrolled in this course');
        err.status = 403; err.code = 'FORBIDDEN';
        throw err;
    }

    // Get the course so we know the total number of modules.
    // We need this to calculate percentComplete accurately.
    const course = await Course.findById(courseId);
    if (!course) {
        const err = new Error('Course not found');
        err.status = 404; err.code = 'NOT_FOUND';
        throw err;
    }

    // Find or create the progress record for this learner + course pair.
    // upsert: true means "create if it doesn't exist yet"
    let progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
        progress = new Progress({ user: userId, course: courseId });
    }

    // Only add the module if it hasn't been completed already.
    // This prevents double-counting if the learner replays a module.
    if (!progress.completedModules.includes(moduleId)) {
        progress.completedModules.push(moduleId);
    }

    // Recompute percentage — completed / total * 100, rounded to nearest integer
    const totalModules = course.modules.length;
    progress.percentComplete = totalModules > 0
        ? Math.round((progress.completedModules.length / totalModules) * 100)
        : 0;

    // ── Streak logic ──────────────────────────────────────────────────────────
    const now = new Date();
    const todayWAT = toWATDateString(now);

    if (progress.lastActivityAt) {
        const lastWAT = toWATDateString(progress.lastActivityAt);

        // How many days ago was the last activity, in WAT?
        const todayMs = new Date(todayWAT).getTime();
        const lastMs = new Date(lastWAT).getTime();
        const diffDays = Math.round((todayMs - lastMs) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same WAT day — streak stays the same, no double-increment
        } else if (diffDays === 1) {
            // Consecutive day — increment streak
            progress.streakDays += 1;
        } else {
            // Gap of 2+ days — streak is broken, reset to 1
            progress.streakDays = 1;
        }
    } else {
        // First ever activity — start the streak at 1
        progress.streakDays = 1;
    }

    progress.lastActivityAt = now;
    await progress.save();

    return progress;
};

// ─── FULL PROGRESS SUMMARY ────────────────────────────────────────────────────
// Returns progress across ALL courses the learner is enrolled in.
// Useful for the dashboard overview screen.
const getFullProgress = async (userId) => {
    const progressRecords = await Progress.find({ user: userId })
        .populate('course', 'title level category thumbnailUrl modules')
        .sort({ lastActivityAt: -1 });

    return { progress: progressRecords };
};

// ─── STREAK SUMMARY ───────────────────────────────────────────────────────────
// Returns just the streak info — used by the streak widget on the dashboard.
// We take the highest streakDays across all courses because a learner's
// overall streak should reflect any learning activity, not per-course.
const getStreak = async (userId) => {
    const records = await Progress.find({ user: userId })
        .sort({ streakDays: -1 })
        .limit(1);

    if (!records.length) {
        return { streakDays: 0, lastActivityAt: null };
    }

    return {
        streakDays: records[0].streakDays,
        lastActivityAt: records[0].lastActivityAt
    };
};

// ─── SINGLE COURSE PROGRESS ───────────────────────────────────────────────────
// Returns detailed progress for one specific course.
// Used on the individual course page.
const getCourseProgress = async (userId, courseId) => {
    const progress = await Progress.findOne({ user: userId, course: courseId })
        .populate('course', 'title level modules');

    if (!progress) {
        // Not started yet — return a zeroed-out object instead of 404
        // because the learner may be enrolled but hasn't started yet
        return {
            courseId,
            completedModules: [],
            percentComplete: 0,
            streakDays: 0,
            lastActivityAt: null
        };
    }

    return progress;
};

module.exports = { logProgress, getFullProgress, getStreak, getCourseProgress };