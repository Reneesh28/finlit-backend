const FinancialProfile = require('../models/FinancialProfile');

// @desc   Create or update financial profile
// @route  POST /api/profile
// @access Private
const setFinancialProfile = async (req, res) => {
    try {
        const {
            monthlyIncome,
            savingsGoal,
            fixedExpenses,
            variableExpenses
        } = req.body;

        // Find existing profile
        let profile = await FinancialProfile.findOne({
            user: req.user._id
        });

        if (profile) {
            // Update existing
            profile.monthlyIncome = monthlyIncome ?? profile.monthlyIncome;
            profile.savingsGoal = savingsGoal ?? profile.savingsGoal;
            profile.fixedExpenses = fixedExpenses ?? profile.fixedExpenses;
            profile.variableExpenses = variableExpenses ?? profile.variableExpenses;

            await profile.save();
        } else {
            // Create new
            profile = await FinancialProfile.create({
                user: req.user._id,
                monthlyIncome,
                savingsGoal,
                fixedExpenses,
                variableExpenses
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getFinancialProfile = async (req, res) => {
    try {
        const profile = await FinancialProfile.findOne({
            user: req.user._id
        });

        if (!profile) {
            return res.status(404).json({
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    setFinancialProfile,
    getFinancialProfile
};