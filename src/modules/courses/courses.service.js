const Course = require('../../models/course.model');

// BROWSE APPROVED COURSES
// Only returns courses with status: 'approved' — learners must never see
// draft, pending, or rejected courses. That's the lecturer/admin concern.
// Supports pagination and filtering by level and tag.
const getCourses = async (query = {}) => {
    const page  = parseInt(query.page)  || 1;
    const limit = parseInt(query.limit) || 10;
    const skip  = (page - 1) * limit;

    // Always start with the approved filter — this is non-negotiable
    const filter = { status: 'approved' };

    // Optional: filter by difficulty level e.g. ?level=Beginner
    if (query.level) filter.level = query.level;

    // Optional: filter by tag e.g. ?tag=python
    // $in means "the tags array contains this value"
    if (query.tag) filter.tags = { $in: [query.tag] };

    const [courses, total] = await Promise.all([
        Course.find(filter)
            .select('title description level category tags thumbnailUrl enrollmentCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Course.countDocuments(filter)
    ]);

    return {
        courses,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// GET ONE COURSE
// Returns the full course including all modules.
// Only approved courses are accessible to learners.
const getCourseById = async (courseId) => {
    const course = await Course.findOne({
        _id: courseId,
        status: 'approved'
    });

    if (!course) {
        const err = new Error('Course not found');
        err.status = 404; err.code = 'NOT_FOUND';
        throw err;
    }

    return course;
};

// SEARCH COURSES
// Searches title, description, and tags.
// MongoDB $text search requires a text index — but we use $regex here
// because it works without index setup and is fine for MVP scale.
const searchCourses = async (query = {}) => {
    const page  = parseInt(query.page)  || 1;
    const limit = parseInt(query.limit) || 10;
    const skip  = (page - 1) * limit;

    if (!query.q) {
        const err = new Error('Search query "q" is required');
        err.status = 400; err.code = 'BAD_REQUEST';
        throw err;
    }

    // Case-insensitive regex search across title and description
    const regex = new RegExp(query.q, 'i');

    const filter = {
        status: 'approved',   // always enforce this
        $or: [
            { title: regex },
            { description: regex },
            { tags: regex }
        ]
    };

    // Optional: also filter search results by level
    if (query.level) filter.level = query.level;

    const [courses, total] = await Promise.all([
        Course.find(filter)
            .select('title description level category tags thumbnailUrl enrollmentCount')
            .sort({ enrollmentCount: -1 })  // most popular first in search results
            .skip(skip)
            .limit(limit),
        Course.countDocuments(filter)
    ]);

    return {
        courses,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
};

module.exports = { getCourses, getCourseById, searchCourses };