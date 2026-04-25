const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true,
        min: 0 // ✅ FIX
    },
    spent: {
        type: Number,
        default: 0,
        min: 0 // ✅ FIX
    },
    month: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Budget', budgetSchema);