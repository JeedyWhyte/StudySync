const { client } = require('../config/redis');

// RATE LIMITER 

// Limits each IP address to a set number of requests per window
// Uses Redis to track request counts across server restarts

const rateLimiter = (maxRequests = 100, windowSeconds = 60) => {
    return async (req, res, next) => {
        try {
            // Build a unique key for this IP address
            const key = `ratelimit:${req.ip}`;

            // Increment the request count for this IP
            const requests = await client.incr(key);

            // On the first request, set the expiry window
            // This resets the count after windowSeconds
            if (requests === 1) {
                await client.expire(key, windowSeconds);
            }

            // If the count exceeds the limit, reject the request
            if (requests > maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests. Please slow down.',
                    error: { code: 'RATE_LIMIT_EXCEEDED', details: [] }
                });
            }

            // Add headers so the client knows their limit status
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', maxRequests - requests);

            next();
        } catch (err) {
            // If Redis fails, allow the request through
            // Never block users because of a rate limiter error
            console.error('Rate limiter error:', err.message);
            next();
        }
    };
};

module.exports = rateLimiter;