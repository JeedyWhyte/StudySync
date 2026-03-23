const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/course.model');
const User = require('../models/user.model');

const seedCourses = async () => {
    await connectDB();

    // Find the test lecturer to assign as course creator
    const lecturer = await User.findOne({ role: 'lecturer' });
    if (!lecturer) {
        console.error('❌ No lecturer found. Run create-lecturer.js first.');
        process.exit(1);
    }

    const courses = [
        {
            title: 'Introduction to Python Programming',
            description: 'Learn Python from scratch. Covers variables, loops, functions, and basic data structures.',
            level: 'Beginner',
            category: 'Programming',
            tags: ['python', 'programming', 'beginner'],
            status: 'approved',
            offlineAvailable: true,
            createdBy: lecturer._id,
            modules: [
                { title: 'Setting Up Python', durationMins: 20, resourceUrl: 'https://example.com/module1' },
                { title: 'Variables and Data Types', durationMins: 30, resourceUrl: 'https://example.com/module2' },
                { title: 'Control Flow', durationMins: 45, resourceUrl: 'https://example.com/module3' },
                { title: 'Functions', durationMins: 40, resourceUrl: 'https://example.com/module4' },
                { title: 'Lists and Dictionaries', durationMins: 35, resourceUrl: 'https://example.com/module5' }
            ]
        },
        {
            title: 'Data Science Fundamentals',
            description: 'An introduction to data science concepts including statistics, data cleaning, and visualization.',
            level: 'Intermediate',
            category: 'Data Science',
            tags: ['data science', 'statistics', 'python', 'intermediate'],
            status: 'approved',
            offlineAvailable: false,
            createdBy: lecturer._id,
            modules: [
                { title: 'What is Data Science?', durationMins: 25, resourceUrl: 'https://example.com/ds1' },
                { title: 'Statistics Basics', durationMins: 50, resourceUrl: 'https://example.com/ds2' },
                { title: 'Data Cleaning with Pandas', durationMins: 60, resourceUrl: 'https://example.com/ds3' },
                { title: 'Data Visualization', durationMins: 45, resourceUrl: 'https://example.com/ds4' }
            ]
        },
        {
            title: 'Web Development with Node.js',
            description: 'Build REST APIs with Node.js and Express. Covers routing, middleware, and MongoDB integration.',
            level: 'Intermediate',
            category: 'Web Development',
            tags: ['nodejs', 'express', 'backend', 'intermediate'],
            status: 'approved',
            offlineAvailable: false,
            createdBy: lecturer._id,
            modules: [
                { title: 'Node.js Basics', durationMins: 30, resourceUrl: 'https://example.com/node1' },
                { title: 'Express Routing', durationMins: 40, resourceUrl: 'https://example.com/node2' },
                { title: 'Middleware', durationMins: 35, resourceUrl: 'https://example.com/node3' },
                { title: 'MongoDB with Mongoose', durationMins: 55, resourceUrl: 'https://example.com/node4' },
                { title: 'Building a REST API', durationMins: 70, resourceUrl: 'https://example.com/node5' }
            ]
        },
        {
            title: 'Advanced Machine Learning',
            description: 'Deep dive into machine learning algorithms, model training, and deployment.',
            level: 'Advanced',
            category: 'Data Science',
            tags: ['machine learning', 'AI', 'advanced', 'python'],
            status: 'approved',
            offlineAvailable: false,
            createdBy: lecturer._id,
            modules: [
                { title: 'Supervised Learning', durationMins: 60, resourceUrl: 'https://example.com/ml1' },
                { title: 'Unsupervised Learning', durationMins: 55, resourceUrl: 'https://example.com/ml2' },
                { title: 'Neural Networks', durationMins: 75, resourceUrl: 'https://example.com/ml3' },
                { title: 'Model Deployment', durationMins: 50, resourceUrl: 'https://example.com/ml4' }
            ]
        }
    ];

    // Clear existing seeded courses first to avoid duplicates
    await Course.deleteMany({ createdBy: lecturer._id });
    console.log('🗑️  Cleared existing test courses');

    // Insert all courses
    await Course.insertMany(courses);

    console.log(`✅ ${courses.length} courses seeded successfully`);
    console.log('─────────────────────────────────────────────');
    courses.forEach(c => console.log(`   • ${c.title} (${c.level})`));
    console.log('─────────────────────────────────────────────');

    await mongoose.disconnect();
    process.exit(0);
};

seedCourses().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});