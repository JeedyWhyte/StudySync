const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return error(res, 'No token provided', 401, 'UNAUTHORIZED');
    }
    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return error(res, 'Invalid or expired token', 401, 'UNAUTHORIZED');
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return error(res, 'Access denied', 403, 'FORBIDDEN');
    }
    next();
};

module.exports = { authenticate, requireRole };