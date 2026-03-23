const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: { code: err.code ||'SERVER_ERROR', details: [] }
    });
};

module.exports = errorHandler;