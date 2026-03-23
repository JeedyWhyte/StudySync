const express = require('express');
const errorHandler = require('./middleware/errorHandler');
// Call Routes
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.send('Server is running!');
});

app.use('/auth', authRoutes);
    
app.use(errorHandler);

module.exports = app;