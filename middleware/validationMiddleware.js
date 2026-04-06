const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('name')
        .notEmpty()
        .withMessage('Name is required'),

    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Transaction validation rules
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
            'food',
            'rent',
            'transport',
            'entertainment',
            'utilities',
            'salary',
            'other'
        ])
        .withMessage('Invalid category'),

    body('description')
        .optional()
        .isString()
        .trim()
];

// Middleware to check errors
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
    validateTransaction,
    validate,
    validateRegister
};