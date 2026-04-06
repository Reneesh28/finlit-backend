const Budget = require('../models/Budget');

// @desc   Set or update budget
// @route  POST /api/budget
// @access Private
const setBudget = async (req, res) => {
    try {
        const { category, limit, month } = req.body;

        if (!category || !limit || !month) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        let budget = await Budget.findOne({
            user: req.user._id,
            category,
            month
        });
        if (budget) {
            // Update existing
            budget.limit = limit;
            await budget.save();
        } else {
            // Create new
            budget = await Budget.create({
                user: req.user._id,
                category,
                limit,
                month
            });
        }
        res.status(200).json({
            success: true,
            data: budget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getBudgets = async (req, res) => {
    try {
        const { month } = req.query;

        const query = {
            user: req.user._id
        };

        if (month) {
            query.month = month;
        }

        const budgets = await Budget.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: budgets.length,
            data: budgets
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    setBudget,
    getBudgets
};