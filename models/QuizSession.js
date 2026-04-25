const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion'
    }],
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Session expires in 1 hour
    }
});

module.exports = mongoose.model('QuizSession', quizSessionSchema);
