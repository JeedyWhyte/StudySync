const User = require('../../models/user.model');
const Course = require('../../models/course.model');

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

module.exports = {
    getProfile,
    createCourse,
    getMyCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule
};