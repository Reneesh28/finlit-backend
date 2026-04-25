const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const FinancialProfile = require('../models/FinancialProfile');

// 🚀 FINAL INSIGHT ENGINE
const getInsights = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 📊 Category Distribution
    const distribution = await Transaction.aggregate([
        {
            $match: {
                user: userId,
                type: 'expense',
                date: { $gte: startOfCurrentMonth }
            }
        },
        {
            $group: {
                _id: '$category',
                totalSpent: { $sum: '$amount' }
            }
        }
    ]);

    // ⚠️ Budget Alerts
    const currentMonth = now.toISOString().slice(0, 7);

    const budgetAlerts = await Budget.find({
        user: userId,
        month: currentMonth,
        $expr: { $gt: ['$spent', '$limit'] }
    });

    // 📈 Monthly Trends
    const currentMonthData = await Transaction.aggregate([
        {
            $match: {
                user: userId,
                type: 'expense',
                date: { $gte: startOfCurrentMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    const previousMonthData = await Transaction.aggregate([
        {
            $match: {
                user: userId,
                type: 'expense',
                date: {
                    $gte: startOfPreviousMonth,
                    $lte: endOfPreviousMonth
                }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    const currentExpenses = currentMonthData[0]?.total || 0;
    const previousExpenses = previousMonthData[0]?.total || 0;

    // 💰 Financial Profile (NEW FIX)
    const profile = await FinancialProfile.findOne({ user: userId });

    const monthlyIncome = profile?.monthlyIncome || 0;

    // 🧠 RULE-BASED INSIGHTS
    const insights = [];

    const categoryMap = {};
    distribution.forEach((item) => {
        categoryMap[item._id] = item.totalSpent;
    });

    // 1️⃣ Budget Overspending
    budgetAlerts.forEach((b) => {
        insights.push({
            type: 'warning',
            message: `You exceeded your budget for ${b.category}`,
            severity: 'high'
        });
    });

    // 2️⃣ High Category Spending
    Object.keys(categoryMap).forEach((category) => {
        if (categoryMap[category] > 10000) {
            insights.push({
                type: 'warning',
                message: `High spending detected in ${category}`,
                severity: 'medium'
            });
        }
    });

    // 3️⃣ Savings Warning (NEW FIX)
    if (monthlyIncome > 0 && currentExpenses > monthlyIncome) {
        insights.push({
            type: 'warning',
            message: `Your expenses (${currentExpenses}) exceed your income (${monthlyIncome})`,
            severity: 'high'
        });
    }

    // 4️⃣ Trend Insight
    if (previousExpenses > 0 && currentExpenses > previousExpenses) {
        insights.push({
            type: 'info',
            message: `Your spending increased compared to last month`,
            severity: 'low'
        });
    }

    res.status(200).json({
        distribution,
        budgetAlerts,
        trends: {
            currentMonth: currentExpenses,
            previousMonth: previousExpenses
        },
        insights
    });
});

module.exports = {
    getInsights
};