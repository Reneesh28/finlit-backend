const mongoose = require('mongoose');

const financialProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    monthlyIncome: {
        type: Number,
        default: 0
    },
    savingsGoal: {
        type: Number,
        default: 0
    },
    fixedExpenses: {
        type: Number,
        default: 0
    },
    variableExpenses: {
        type: Number,
        default: 0
    },
    financialHealthScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ✅ FIX (prevents overwrite error)
module.exports =
    mongoose.models.FinancialProfile ||
    mongoose.model('FinancialProfile', financialProfileSchema);