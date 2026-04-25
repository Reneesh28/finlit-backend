const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const { registerUser, loginUser } = require('../controllers/authControllers');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Try again later.'
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many registrations. Try again later.'
});

// Throttling for login
const loginSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: () => 500
});

// Routes
router.post(
  '/register',
  registerLimiter,
  validateRegister,
  registerUser
);

router.post(
  '/login',
  loginLimiter,
  loginSpeedLimiter,
  validateLogin,
  loginUser
);

module.exports = router;