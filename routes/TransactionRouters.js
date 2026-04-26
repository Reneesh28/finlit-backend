const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction
} = require('../controllers/TransactionControllers');

const { validateTransaction, validate } = require('../middleware/validationMiddleware');

router.post('/', protect, validateTransaction, validate, addTransaction);
router.get('/', protect, getTransactions);
router.put('/:id', protect, validateTransaction, validate, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;