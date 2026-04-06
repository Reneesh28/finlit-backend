const Transaction = require('../models/Transaction');

// @desc   Add income/expense
// @route  POST /api/transactions
// @access Private
const addTransaction = async (req, res) => {
    try {
        const { type, amount, category, description } = req.body;
        if (!type || !amount) {
            return res.status(400).json({ message: 'Type and amount are required' });
        }
        const transaction = await Transaction.create({
            user: req.user._id, // safer than id
            type,
            amount,
            category,
            description
        });
        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user._id
        }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    addTransaction,
    getTransactions
};