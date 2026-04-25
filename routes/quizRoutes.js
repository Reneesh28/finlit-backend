const express = require('express');
const router = express.Router();

const {
    getQuizQuestions,
    submitQuiz,
    getUserResults,
    getUserQuizAnalytics,
    getLeaderboard,
    explainAnswers,
    generateQuizQuestions
} = require('../controllers/quizController');

const protect = require('../middleware/authMiddleware');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const { quizLimiter, generateLimiter } = require('../middleware/quizRateLimiter');

// ================= USER ROUTES =================

// Get quiz questions
router.get('/', protect, quizLimiter, getQuizQuestions);

// Submit quiz
router.post('/submit', protect, quizLimiter, submitQuiz);

// Get user results
router.get('/results', protect, quizLimiter, getUserResults);

// Analytics
router.get('/analytics', protect, quizLimiter, getUserQuizAnalytics);

// Leaderboard
router.get('/leaderboard', protect, quizLimiter, getLeaderboard);

// AI Explanations
router.post('/explain', protect, quizLimiter, explainAnswers);

router.post(
    '/generate',
    apiKeyMiddleware,
    generateLimiter,
    generateQuizQuestions
);

module.exports = router;