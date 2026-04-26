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
        const financialProfile = await FinancialProfile.findOne({
            user: req.user._id
        });

        // Combine user basic info (XP, streak, etc.) with financial profile
        const responseData = {
            name: req.user.name,
            email: req.user.email,
            xp: req.user.xp,
            streak: req.user.streak,
            role: req.user.role,
            financials: financialProfile || {
                monthlyIncome: 0,
                savingsGoal: 0,
                fixedExpenses: 0,
                variableExpenses: 0
            }
        };

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
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