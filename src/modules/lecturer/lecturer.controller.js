const lecturerService = require('./lecturer.service');
const { success, error } = require('../../utils/response');

const getProfile = async (req, res, next) => {
    try {
        const data = await lecturerService.getProfile(req.user.userId);
        return success(res, data);
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const data = await lecturerService.updateProfile(req.user.userId, req.body);
        return success(res, data, 'Profile updated');
    } catch (err) {
        next(err);
    }
};

// CREATE COURSE
const createCourse = async (req, res, next) => {
    try {
        const data = await lecturerService.createCourse(
            req.user.userId,
            req.body
        );
        return success(res, data, 'Course created successfully', 201);
    } catch (err) {
        next(err);
    }
};

// GET MY COURSES
const getMyCourses = async (req, res, next) => {
    try {
        const data = await lecturerService.getMyCourses(req.user.userId);
        return success(res, data);
    } catch (err) {
        next(err);
    }
};

// GET ONE COURSE
const getCourseById = async (req, res, next) => {
    try {
        const data = await lecturerService.getCourseById(
            req.user.userId,
            req.params.id
        );
        return success(res, data);
    } catch (err) {
        next(err);
    }
};

// UPDATE COURSE
const updateCourse = async (req, res, next) => {
    try {
        const data = await lecturerService.updateCourse(
            req.user.userId,
            req.params.id,
            req.body
        );
        return success(res, data, 'Course updated successfully');
    } catch (err) {
        next(err);
    }
};

// SUBMIT COURSE FOR APPROVAL
const submitCourse = async (req, res, next) => {
    try {
        const data = await lecturerService.submitCourse(
            req.user.userId,
            req.params.id
        );
        return success(res, data, 'Course submitted for approval');
    } catch (err) {
        next(err);
    }
};

// DELETE COURSE
const deleteCourse = async (req, res, next) => {
    try {
        await lecturerService.deleteCourse(req.user.userId, req.params.id);
        return success(res, {}, 'Course deleted successfully');
    } catch (err) {
        next(err);
    }
};

// ADD MODULE
const addModule = async (req, res, next) => {
    try {
        const data = await lecturerService.addModule(
            req.user.userId,
            req.params.id,
            req.body
        );
        return success(res, data, 'Module added successfully', 201);
    } catch (err) {
        next(err);
    }
};

// UPDATE MODULE
const updateModule = async (req, res, next) => {
    try {
        const data = await lecturerService.updateModule(
            req.user.userId,
            req.params.id,
            req.params.mId,
            req.body
        );
        return success(res, data, 'Module updated successfully');
    } catch (err) {
        next(err);
    }
};

// DELETE MODULE
const deleteModule = async (req, res, next) => {
    try {
        await lecturerService.deleteModule(
            req.user.userId,
            req.params.id,
            req.params.mId
        );
        return success(res, {}, 'Module deleted successfully');
    } catch (err) {
        next(err);
    }
};// GET ENROLLED STUDENTS
const getEnrolledStudents = async (req, res, next) => {
    try {
        const data = await lecturerService.getEnrolledStudents(
            req.user.userId,
            req.params.id
        );
        return success(res, data, 'Enrolled students retrieved');
    } catch (err) {
        next(err);
    }
};

// GET COURSE PROGRESS STATS
const getCourseProgress = async (req, res, next) => {
    try {
        const data = await lecturerService.getCourseProgress(
            req.user.userId,
            req.params.id
        );
        return success(res, data, 'Course progress retrieved');
    } catch (err) {
        next(err);
    }
};

// UPLOAD COURSE THUMBNAIL
const uploadCourseThumbnail = async (req, res, next) => {
    try {
        // req.file comes from Multer middleware applied on the route
        if (!req.file) {
            return error(res, 'No file uploaded', 400, 'VALIDATION_ERROR');
        }

        const data = await lecturerService.uploadCourseThumbnail(
            req.user.userId,
            req.params.id,
            req.file.buffer   // Multer memoryStorage puts the file here
        );
        return success(res, data, 'Thumbnail uploaded successfully');
    } catch (err) {
        next(err);
    }
};

// UPLOAD MODULE VIDEO
const uploadModuleVideo = async (req, res, next) => {
    try {
        if (!req.file) {
            return error(res, 'No file uploaded', 400, 'VALIDATION_ERROR');
        }

        const data = await lecturerService.uploadModuleVideo(
            req.user.userId,
            req.params.id,
            req.params.mId,
            req.file.buffer
        );
        return success(res, data, 'Video uploaded successfully');
    } catch (err) {
        next(err);
    }
};

// NOTIFY COURSE APPROVED (called by admin after approving in Atlas)
const notifyCourseApproved = async (req, res, next) => {
    try {
        await lecturerService.notifyCourseApproved(req.params.id);
        return success(res, {}, 'Approval notification sent');
    } catch (err) {
        next(err);
    }
};

// NOTIFY COURSE REJECTED (called by admin after rejecting in Atlas)
const notifyCourseRejected = async (req, res, next) => {
    try {
        // reason comes from the request body
        const { reason } = req.body;

        if (!reason) {
            return error(res, 'Rejection reason is required', 400, 'VALIDATION_ERROR');
        }

        await lecturerService.notifyCourseRejected(req.params.id, reason);
        return success(res, {}, 'Rejection notification sent');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    createCourse,
    getMyCourses,
    getCourseById,
    updateCourse,
    submitCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule,
    getEnrolledStudents,  
    getCourseProgress,
    uploadCourseThumbnail,
    uploadModuleVideo,
    notifyCourseApproved,  
    notifyCourseRejected
};
