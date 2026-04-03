const User = require('../../models/user.model');
const Enrollment = require('../../models/enrollment.model');
const Course = require('../../models/course.model');
const Progress   = require('../../models/progress.model');
const { uploadThumbnail } = require('../../utils/upload.service');

// GET PROFILE
// Returns the learner's full user document, minus the password.
// We never expose the password hash — ever.
const getProfile = async (userId) => {
    const [user, enrolledCount, completedCount] = await Promise.all([
        User.findById(userId).select('-password'),
        Enrollment.countDocuments({ user: userId }),
        Progress.countDocuments({ user: userId, percentComplete: 100 })
    ]);

    if (!user) {
        const err = new Error('User not found');
        err.status = 404; err.code = 'NOT_FOUND';
        throw err;
    }

    // Return user data merged with the computed stats
    return {
        ...user.toObject(),
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
    };
};

// UPDATE PROFILE
// Learners can only update safe fields — name and email.
// They cannot change their role, status, or password from here.
// Password changes go through auth/reset-password instead.
const updateProfile = async (userId, updates) => {
    // Whitelist exactly what a learner is allowed to change.
    // Any other field sent in the body is silently ignored.
    const allowed = {};
    if (updates.name) allowed.name = updates.name;
    if (updates.email) allowed.email = updates.email;

    const profileUpdates = {};
    if (updates.phone !== undefined) profileUpdates['profile.phone'] = updates.phone;
    if (updates.bio !== undefined) profileUpdates['profile.bio'] = updates.bio;
    if (updates.university !== undefined) profileUpdates['profile.university'] = updates.university;
    if (updates.course !== undefined) profileUpdates['profile.course'] = updates.course;

    const user = await User.findByIdAndUpdate(
        userId,
        { ...allowed, ...profileUpdates },
        { new: true }
    ).select('-password');


    if (!user) {
        const err = new Error('User not found');
        err.status = 404; err.code = 'NOT_FOUND';
        throw err;
    }

    return user;
};

// UPLOAD AVATAR
const uploadAvatar = async (userId, fileBuffer) => {
    // Reuse the thumbnail uploader — same Cloudinary config, different folder
    const avatarUrl = await uploadThumbnail(fileBuffer, `avatar_${userId}`);

    const user = await User.findByIdAndUpdate(
        userId,
        { 'profile.avatar': avatarUrl },
        { new: true }
    ).select('-password');

    return { avatar: avatarUrl };
};

// ENROLL IN A COURSE
// Creates an Enrollment document linking this learner to the course.
// Also increments course.enrollmentCount — this is a denormalized counter
// that lets us sort courses by popularity without an expensive aggregation.
const enrollInCourse = async (userId, courseId) => {
    // Check the course exists and is approved
    const course = await Course.findOne({ _id: courseId, status: 'approved' });
    if (!course) {
        const err = new Error('Course not found');
        err.status = 404; err.code = 'NOT_FOUND';
        throw err;
    }

    // Check if already enrolled — don't create a duplicate enrollment
    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) {
        const err = new Error('You are already enrolled in this course');
        err.status = 409; err.code = 'CONFLICT';
        throw err;
    }

    // Create the enrollment document
    const enrollment = await Enrollment.create({
        user: userId,
        course: courseId
    });

    // Increment the denormalized counter on the course document
    // $inc is an atomic MongoDB operation — safe even under concurrent requests
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    return enrollment;
};

// GET MY ENROLLMENTS
// Returns all courses this learner has enrolled in.
// We populate course details so the frontend doesn't need a second request.
const getMyEnrollments = async (userId) => {
    const enrollments = await Enrollment.find({ user: userId })
        .populate('course', 'title description level category thumbnailUrl status')
        .sort({ createdAt: -1 });

    return { enrollments };
};

module.exports = { getProfile, updateProfile, uploadAvatar, enrollInCourse, getMyEnrollments };