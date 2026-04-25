const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (val) {
                    return val.length >= 2; // at least 2 options
                },
                message: 'A question must have at least 2 options',
            },
        },
        correctAnswer: {
            type: String,
            required: true,
            validate: {
                validator: function (val) {
                    return this.options.includes(val);
                },
                message: 'Correct answer must be one of the options',
            },
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'easy',
        },
        category: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);