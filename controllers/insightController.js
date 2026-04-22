const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// 📊 Spending Distribution (Monthly)
const getSpendingDistribution = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const distribution = await Transaction.aggregate([
        {
            $match: {
                user: userId,
                type: 'expense',
                date: { $gte: startOfMonth }
            }
        },
        {
            $group: {
                _id: '$category',
                totalSpent: { $sum: '$amount' }
            }
        }
    ]);

    res.status(200).json(distribution);
});

// ⚠️ Budget Overuse Alerts
const getBudgetAlerts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const alerts = await Budget.find({
        user: userId,
        month: currentMonth,
        $expr: { $gt: ['$spent', '$limit'] }
    });

    res.status(200).json(alerts);
});

// 📈 Monthly Trends
const getMonthlyTrends = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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

    res.status(200).json({
        currentMonth: currentMonthData[0]?.total || 0,
        previousMonth: previousMonthData[0]?.total || 0
    });
});

// 🚀 Combined Insight Engine (FINAL)
const getInsights = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 📊 Distribution
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

    // 📈 Trends
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

    const trends = {
        currentMonth: currentMonthData[0]?.total || 0,
        previousMonth: previousMonthData[0]?.total || 0
    };

    // 🧠 INSIGHT ENGINE (RULE-BASED)
    const insights = [];

    const categoryMap = {};
    distribution.forEach((item) => {
        categoryMap[item._id] = item.totalSpent;
    });

    // Budget overspending insights
    budgetAlerts.forEach((b) => {
        insights.push({
            type: 'warning',
            message: `You exceeded your budget for ${b.category}`,
            severity: 'high'
        });
    });

    // High spending insights
    Object.keys(categoryMap).forEach((category) => {
        if (categoryMap[category] > 10000) {
            insights.push({
                type: 'warning',
                message: `High spending detected in ${category}`,
                severity: 'medium'
            });
        }
    });

    res.status(200).json({
        distribution,
        budgetAlerts,
        trends,
        insights
    });
});

module.exports = {
    getSpendingDistribution,
    getBudgetAlerts,
    getMonthlyTrends,
    getInsights
};