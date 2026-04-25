const mongoose = require('mongoose');

const financialProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    monthlyIncome: {
        type: Number,
        default: 0,
        min: 0 // ✅ FIX
    },
    savingsGoal: {
        type: Number,
        default: 0,
        min: 0 // ✅ FIX
    },
    fixedExpenses: {
        type: Number,
        default: 0,
        min: 0 // ✅ FIX
    },
    variableExpenses: {
        type: Number,
        default: 0,
        min: 0 // ✅ FIX
    },
    financialHealthScore: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

module.exports =
    mongoose.models.FinancialProfile ||
    mongoose.model('FinancialProfile', financialProfileSchema);