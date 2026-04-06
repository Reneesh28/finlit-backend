const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const { setBudget, getBudgets } = require('../controllers/BudgetControllers');

// Protected route
router.post('/', protect, setBudget);
router.get('/', protect, getBudgets);

module.exports = router;