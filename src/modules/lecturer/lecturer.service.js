const User = require('../../models/user.model');
const Course = require('../../models/course.model');
const { createNotification } = require('../notifications/notifications.service');
const { addNotificationJob } = require('../../jobs/queues');

const getProfile = async (userId) => {
    return await User.findById(userId).select('-password');
};

// CREATE COURSE
const createCourse = async (userId, courseData) => {
    const course = await Course.create({
        ...courseData,
        createdBy: userId,
        status: 'draft'
    });

    return course;
};

// GET MY COURSES
const getMyCourses = async (userId) => {
    return await Course.find({ createdBy: userId });
};

// GET ONE COURSE
const getCourseById = async (userId, courseId) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    //Ownership check
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    return course;
};

// UPDATE COURSE
const updateCourse = async (userId, courseId, updates) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Ownership check
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    // Update allowed fields
    Object.assign(course, updates);

    await course.save();

    return course;
};

// SUBMIT COURSE FOR APPROVAL
const submitCourse = async (userId, courseId) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Ownership check — a lecturer can only submit their own course
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    // Only draft courses can be submitted
    // Pending/approved/rejected courses should not be resubmitted this way
    if (course.status !== 'draft') {
        const err = new Error('Only draft courses can be submitted for approval');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // A course must have at least one module before it can be submitted
    // This is a hard rule from the PRD — enforced here in the service, not the controller
    if (!course.modules || course.modules.length === 0) {
        const err = new Error('Course must have at least one module before submitting');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    // Transition status from draft to pending
    course.status = 'pending';
    await course.save();

    return course;
};

// DELETE COURSE
const deleteCourse = async (userId, courseId) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Ownership check
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    // Optional rule:- only delete drafts
    if (course.status !== 'draft') {
        const err = new Error('Only draft courses can be deleted');
        err.status = 400;
        err.code = 'BAD_REQUEST';
        throw err;
    }

    await course.deleteOne();
};

// ADD MODULE
const addModule = async (userId, courseId, moduleData) => {
    const course = await Course.findById(courseId);

    if (!course) {
        throw new Error('Course not found');
    }

    if (course.createdBy.toString() !== userId) {
        throw new Error('Unauthorized');
    }

    course.modules.push(moduleData);

    await course.save();

    return course;
};

// UPDATE MODULE
const updateModule = async (userId, courseId, moduleId, updates) => {
    const course = await Course.findById(courseId);

    if (!course) throw new Error('Course not found');

    if (course.createdBy.toString() !== userId) {
        throw new Error('Unauthorized');
    }

    const module = course.modules.id(moduleId);

    if (!module) {
        throw new Error('Module not found');
    }

    Object.assign(module, updates);

    await course.save();

    return course;
};

// DELETE MODULE
const deleteModule = async (userId, courseId, moduleId) => {
    const course = await Course.findById(courseId);

    if (!course) throw new Error('Course not found');

    if (course.createdBy.toString() !== userId) {
        throw new Error('Unauthorized');
    }

    const module = course.modules.id(moduleId);

    if (!module) {
        throw new Error('Module not found');
    }

    module.deleteOne(); //removes it from array

    await course.save();
};

// GET ENROLLED STUDENTS
// Returns a list of learners enrolled in a specific course
const getEnrolledStudents = async (userId, courseId) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Ownership check — lecturer can only view students in their own courses
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    // Query the Enrollment collection for all enrollments on this course
    // Populate learner name and email — never expose password
    const Enrollment = require('../../models/enrollment.model');
    const enrollments = await Enrollment.find({ course: courseId })
        .populate('user', 'name email createdAt')
        .sort({ createdAt: -1 });

    return {
        course: {
            id: course._id,
            title: course.title,
            enrollmentCount: course.enrollmentCount
        },
        students: enrollments.map(e => ({
            userId: e.user._id,
            name: e.user.name,
            email: e.user.email,
            enrolledAt: e.createdAt
        }))
    };
};

// GET COURSE PROGRESS STATS
// Returns completion statistics for all students enrolled in a course
const getCourseProgress = async (userId, courseId) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Ownership check
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    const Progress = require('../../models/progress.model');

    // Get all progress documents for this course
    const progressRecords = await Progress.find({ course: courseId })
        .populate('user', 'name email');

    // Calculate aggregate stats
    const totalStudents = progressRecords.length;
    const completedStudents = progressRecords.filter(
        p => p.percentComplete === 100
    ).length;

    const averageCompletion = totalStudents > 0
        ? Math.round(
            progressRecords.reduce((sum, p) => sum + p.percentComplete, 0) / totalStudents
        )
        : 0;

    return {
        course: {
            id: course._id,
            title: course.title,
            totalModules: course.modules.length
        },
        stats: {
            totalStudents,
            completedStudents,
            averageCompletion,
            completionRate: totalStudents > 0
                ? Math.round((completedStudents / totalStudents) * 100)
                : 0
        },
        students: progressRecords.map(p => ({
            userId: p.user._id,
            name: p.user.name,
            email: p.user.email,
            percentComplete: p.percentComplete,
            completedModules: p.completedModules.length,
            streakDays: p.streakDays,
            lastActivityAt: p.lastActivityAt
        }))
    };
};

// UPLOAD COURSE THUMBNAIL
const uploadCourseThumbnail = async (userId, courseId, fileBuffer) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Ownership check — lecturer can only upload to their own course
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    const { uploadThumbnail } = require('../../utils/upload.service');
    const thumbnailUrl = await uploadThumbnail(fileBuffer, courseId);

    course.thumbnailUrl = thumbnailUrl;
    await course.save();

    return { thumbnailUrl };
};

// UPLOAD MODULE VIDEO
const uploadModuleVideo = async (userId, courseId, moduleId, fileBuffer) => {
    const course = await Course.findById(courseId);

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Ownership check
    if (course.createdBy.toString() !== userId) {
        const err = new Error('Unauthorized access to this course');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }

    const module = course.modules.id(moduleId);

    if (!module) {
        const err = new Error('Module not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    const { uploadModuleVideo: uploadToCloud } = require('../../utils/upload.service');
    const videoUrl = await uploadToCloud(fileBuffer, courseId, moduleId);

    module.videoUrl = videoUrl;
    await course.save();

    return { videoUrl };
};

// NOTIFY COURSE APPROVED
// Called when admin approves a course via Atlas
// Creates an in-app notification and queues an email to the lecturer
const notifyCourseApproved = async (courseId) => {
    const course = await Course.findById(courseId).populate('createdBy', 'name email');

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Create the in-app notification for the lecturer
    await createNotification({
        userId: course.createdBy._id,
        type: 'course_approved',
        title: 'Course Approved',
        message: `Your course "${course.title}" has been approved and is now live`,
        meta: { courseId: course._id }
    });

    // Queue the email via BullMQ — notification worker handles the actual sending
    await addNotificationJob('course_approved', {
        userId: course.createdBy._id,
        meta: { courseId: course._id }
    });
};

// NOTIFY COURSE REJECTED
// Called when admin rejects a course via Atlas
// Includes the rejection reason in both the in-app notification and email
const notifyCourseRejected = async (courseId, reason) => {
    const course = await Course.findById(courseId).populate('createdBy', 'name email');

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Create the in-app notification with the reason included
    await createNotification({
        userId: course.createdBy._id,
        type: 'course_rejected',
        title: 'Course Needs Changes',
        message: `Your course "${course.title}" was not approved: ${reason}`,
        meta: { courseId: course._id, reason }
    });

    // Queue the email
    await addNotificationJob('course_rejected', {
        userId: course.createdBy._id,
        meta: { courseId: course._id, reason }
    });
};

module.exports = {
    getProfile,
    createCourse,
    getMyCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule,
    submitCourse,
    getEnrolledStudents,
    getCourseProgress,
    uploadCourseThumbnail, 
    uploadModuleVideo,
    notifyCourseApproved,  
    notifyCourseRejected
};