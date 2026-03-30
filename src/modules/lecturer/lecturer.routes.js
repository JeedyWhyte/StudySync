const express = require('express');
const router = express.Router();

const lecturerController = require('./lecturer.controller');
const { authenticate, requireRole } = require('../../middleware/auth');

// Lecturer profile
router.get(
    '/profile', 
    authenticate, 
    requireRole('lecturer'), 
    lecturerController.getProfile
);

// Create course
router.post(
    '/courses',
    authenticate,
    requireRole('lecturer'),
    lecturerController.createCourse
);

// Get my courses
router.get(
    '/courses',
    authenticate,
    requireRole('lecturer'),
    lecturerController.getMyCourses
);

// Get one course
router.get(
    '/courses/:id',
    authenticate,
    requireRole('lecturer'),
    lecturerController.getCourseById
);

// Update course
router.patch(
    '/courses/:id',
    authenticate,
    requireRole('lecturer'),
    lecturerController.updateCourse
);

// SUBMIT COURSE FOR APPROVAL
router.post(
    '/courses/:id/submit',
    authenticate,
    requireRole('lecturer'),
    lecturerController.submitCourse
);

// Delete course
router.delete(
    '/courses/:id', 
    authenticate, 
    requireRole('lecturer'), 
    lecturerController.deleteCourse
);

// ADD MODULE
router.post(
    '/courses/:id/modules',
    authenticate,
    requireRole('lecturer'),
    lecturerController.addModule
);

// UPDATE MODULE
router.patch(
    '/courses/:id/modules/:mId',
    authenticate,
    requireRole('lecturer'),
    lecturerController.updateModule
);

// DELETE MODULE
router.delete(
    '/courses/:id/modules/:mId',
    authenticate,
    requireRole('lecturer'),
    lecturerController.deleteModule
);

// GET ENROLLED STUDENTS
router.get(
    '/courses/:id/students',
    authenticate,
    requireRole('lecturer'),
    lecturerController.getEnrolledStudents
);

// GET COURSE PROGRESS STATS
router.get(
    '/courses/:id/progress',
    authenticate,
    requireRole('lecturer'),
    lecturerController.getCourseProgress
);

module.exports = router;