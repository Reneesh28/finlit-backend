const { body, validationResult } = require('express-validator');

// ================= AUTH =================

// Register Validation
const validateRegister = [
    body('name')
        .notEmpty()
        .withMessage('Name is required'),

    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

// Login Validation
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// ================= TRANSACTION =================

const validateTransaction = [
    body('type')
        .isIn(['income', 'expense'])
        .withMessage('Type must be income or expense'),

    body('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),

    body('category')
        .optional()
        .isIn([
            'Food',
            'Shopping',
            'Digital',
            'Housing',
            'Income',
            'Transport',
            'Utilities',
            'Entertainment',
            'Other'
        ])
        .withMessage('Invalid category'),

    body('description')
        .optional()
        .isString()
        .trim()
];

// ================= PROFILE (NEW) =================

const validateProfile = [
    body('monthlyIncome')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Monthly income must be ≥ 0'),

    body('savingsGoal')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Savings goal must be ≥ 0'),

    body('fixedExpenses')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Fixed expenses must be ≥ 0'),

    body('variableExpenses')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Variable expenses must be ≥ 0')
];

// ================= BUDGET (NEW) =================

const validateBudget = [
    body('category')
        .notEmpty()
        .withMessage('Category is required'),

    body('limit')
        .isFloat({ min: 0 })
        .withMessage('Limit must be ≥ 0'),

    body('month')
        .notEmpty()
        .withMessage('Month is required')
];

// ================= COMMON ERROR HANDLER =================

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateTransaction,
    validateProfile,
    validateBudget,
    validate
};