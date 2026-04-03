const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/ratelimiter');
// Call Routes
const authRoutes = require('./modules/auth/auth.routes');
const pathsRoutes = require('./modules/paths/paths.routes');
const chatbotRoutes = require('./modules/chatbot/chatbot.routes');
const lecturerRoutes = require('./modules/lecturer/lecturer.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const learnerRoutes = require('./modules/learner/learner.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const progressRoutes = require('./modules/progress/progress.routes');
const focusRoutes = require('./modules/focus/focus.routes');

const app = express();

app.use(helmet()); // Security Headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging

app.use(express.json());
app.use(rateLimiter());

app.get('/health', (req, res) => {
    res.send('Server is running!');
});

app.use('/api/auth', rateLimiter(20, 60), authRoutes);
app.use('/api/learner/path', pathsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/learner/progress', progressRoutes);
app.use('/api/focus', focusRoutes);

app.use(errorHandler);

module.exports = app;