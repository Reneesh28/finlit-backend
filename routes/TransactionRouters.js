const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const { addTransaction, getTransactions } = require('../controllers/TransactionControllers');
const { validateTransaction, validate } = require('../middleware/validationMiddleware');

// Protected + validated route
router.post('/', protect, validateTransaction, validate, addTransaction);
router.get('/', protect, getTransactions);

module.exports = router;