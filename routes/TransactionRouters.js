const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const {
    addTransaction,
    getTransactions,
    deleteTransaction
} = require('../controllers/TransactionControllers');

const { validateTransaction, validate } = require('../middleware/validationMiddleware');

router.post('/', protect, validateTransaction, validate, addTransaction);
router.get('/', protect, getTransactions);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;