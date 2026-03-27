const express = require('express');
const errorHandler = require('./middleware/errorHandler');
// Call Routes
const authRoutes = require('./modules/auth/auth.routes');
const pathsRoutes = require('./modules/paths/paths.routes');
const chatbotRoutes = require('./modules/chatbot/chatbot.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.send('Server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/learner/path', pathsRoutes);
app.use('/api/chatbot', chatbotRoutes);
    
app.use(errorHandler);

module.exports = app;