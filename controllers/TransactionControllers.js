const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

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
            user: req.user._id,
            type,
            amount,
            category,
            description
        });

        // ✅ FIX: Budget Auto-Sync (ONLY for expenses)
        if (type === 'expense' && category) {
            const currentMonth = new Date().toISOString().slice(0, 7);

            const budget = await Budget.findOne({
                user: req.user._id,
                category,
                month: currentMonth
            });

            if (budget) {
                budget.spent += amount;
                await budget.save();
            }
        }

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


// @desc   Get transactions
// @route  GET /api/transactions
// @access Private
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


// ✅ NEW: Delete Transaction
// @desc   Delete transaction
// @route  DELETE /api/transactions/:id
// @access Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // 🔐 Ownership check
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // ✅ FIX: Reverse budget impact if expense
        if (transaction.type === 'expense' && transaction.category) {
            const currentMonth = transaction.date.toISOString().slice(0, 7);

            const budget = await Budget.findOne({
                user: req.user._id,
                category: transaction.category,
                month: currentMonth
            });

            if (budget) {
                budget.spent -= transaction.amount;
                if (budget.spent < 0) budget.spent = 0;
                await budget.save();
            }
        }

        await transaction.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Transaction deleted'
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
    getTransactions,
    deleteTransaction
};