const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tokensUsed: {
        type: Number,
        default: 0
    },
    cost: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    messages: [messageSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// 🔄 Auto-update lastUpdated when messages change
chatHistorySchema.pre('save', function (next) {
    if (this.isModified('messages')) {
        this.lastUpdated = Date.now();
    }
    next();
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);