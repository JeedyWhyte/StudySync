const express = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.send('Server is running!');
});
    
app.use(errorHandler);

module.exports = app;