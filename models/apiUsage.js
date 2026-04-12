const mongoose = require('mongoose');

const monthlyUsageSchema = new mongoose.Schema({
    month: {
        type: String, // e.g. "2026-04"
        required: true
    },
    totalRequests: {
        type: Number,
        default: 0
    },
    totalTokens: {
        type: Number,
        default: 0
    }
});

const apiUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    requestsToday: {
        type: Number,
        default: 0
    },
    tokensToday: {
        type: Number,
        default: 0
    },
    lastRequestDate: {
        type: Date
    },
    monthlyUsage: [monthlyUsageSchema]
}, { timestamps: true });

module.exports = mongoose.model('APIUsage', apiUsageSchema);