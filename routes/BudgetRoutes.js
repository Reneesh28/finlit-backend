const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const {
    setBudget,
    getBudgets
} = require('../controllers/BudgetControllers');

const { validateBudget, validate } = require('../middleware/validationMiddleware');

router.post('/', protect, validateBudget, validate, setBudget);
router.get('/', protect, getBudgets);

module.exports = router;