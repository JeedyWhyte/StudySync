const express = require('express');
const errorHandler = require('./middleware/errorHandler');
// Call Routes
const authRoutes = require('./modules/auth/auth.routes');
const lecturerRoutes = require('./modules/lecturer/lecturer.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.send('Server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/lecturer', lecturerRoutes); 
app.use(errorHandler);

module.exports = app;