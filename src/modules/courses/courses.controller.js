const coursesService = require('./courses.service');
const { success } = require('../../utils/response');

// GET /api/courses
const getCourses = async (req, res, next) => {
    try {
        // req.query carries ?page=1&limit=10&level=Beginner&tag=python
        const data = await coursesService.getCourses(req.query);
        return success(res, data, 'Courses retrieved');
    } catch (err) {
        next(err);
    }
};

// GET /api/courses/:id
const getCourseById = async (req, res, next) => {
    try {
        const data = await coursesService.getCourseById(req.params.id);
        return success(res, data, 'Course retrieved');
    } catch (err) {
        next(err);
    }
};

// GET /api/courses/search
const searchCourses = async (req, res, next) => {
    try {
        // req.query carries ?q=python&level=Beginner
        const data = await coursesService.searchCourses(req.query);
        return success(res, data, 'Search results retrieved');
    } catch (err) {
        next(err);
    }
};

module.exports = { getCourses, getCourseById, searchCourses };