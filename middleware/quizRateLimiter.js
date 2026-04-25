const rateLimit = require('express-rate-limit');

// General quiz usage limiter (user actions)
const quizLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // max 50 requests per user
    message: {
        success: false,
        message: 'Too many quiz requests. Please try again later.'
    }
});

// Strict limiter for AI generation endpoint
const generateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // stricter limit
    message: {
        success: false,
        message: 'Too many quiz generation requests. Try later.'
    }
});

module.exports = {
    quizLimiter,
    generateLimiter
};