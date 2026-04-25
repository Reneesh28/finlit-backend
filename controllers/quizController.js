const QuizQuestion = require('../models/QuizQuestion');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const axios = require('axios');

// ================= GET QUIZ =================
const getQuizQuestions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 15;

        const questions = await QuizQuestion.aggregate([
            { $sample: { size: limit } },
            {
                $project: {
                    question: 1,
                    options: 1,
                    difficulty: 1,
                    category: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });

    } catch (error) {
        console.error("GET QUIZ ERROR:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================= SUBMIT QUIZ (UPDATED WITH GAMIFICATION) =================
const submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Answers are required'
            });
        }

        const questionIds = answers.map(a => a.questionId);

        const questions = await QuizQuestion.find({
            _id: { $in: questionIds }
        });

        const questionMap = {};
        questions.forEach(q => {
            questionMap[q._id.toString()] = q;
        });

        let score = 0;
        const evaluatedAnswers = [];

        for (const ans of answers) {
            const question = questionMap[ans.questionId];

            if (!question) continue;
            if (!ans.selectedAnswer) continue;
            if (!question.options.includes(ans.selectedAnswer)) continue;

            const isCorrect = question.correctAnswer === ans.selectedAnswer;

            if (isCorrect) score++;

            evaluatedAnswers.push({
                questionId: question._id,
                selectedAnswer: ans.selectedAnswer,
                isCorrect
            });
        }

        if (evaluatedAnswers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid answers submitted"
            });
        }

        const result = await QuizResult.create({
            user: req.user._id,
            score,
            totalQuestions: evaluatedAnswers.length,
            answers: evaluatedAnswers
        });

        // 🏆 GAMIFICATION
        const user = await User.findById(req.user._id);

        const xpEarned = score * 10;
        user.xp += xpEarned;

        const today = new Date();
        const todayStr = today.toDateString();

        if (user.lastQuizDate) {
            const lastDateStr = new Date(user.lastQuizDate).toDateString();

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastDateStr === todayStr) {
                // no change
            } else if (lastDateStr === yesterday.toDateString()) {
                user.streak += 1;
            } else {
                user.streak = 1;
            }
        } else {
            user.streak = 1;
        }

        user.lastQuizDate = today;
        await user.save();

        res.status(201).json({
            success: true,
            data: {
                score,
                totalQuestions: evaluatedAnswers.length,
                resultId: result._id,
                xpEarned,
                totalXP: user.xp,
                streak: user.streak
            }
        });

    } catch (error) {
        console.error("SUBMIT QUIZ ERROR:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================= GET RESULTS =================
const getUserResults = async (req, res) => {
    try {
        const results = await QuizResult.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("RESULTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================= ANALYTICS (WITH CHALLENGE MODE) =================
const getUserQuizAnalytics = async (req, res) => {
    try {
        const results = await QuizResult.find({ user: req.user._id });

        const ALL_CATEGORIES = [
            'budgeting',
            'saving',
            'investing',
            'debt',
            'credit'
        ];

        if (!results.length) {
            return res.status(200).json({
                success: true,
                data: {
                    averageScore: 0,
                    totalAttempts: 0,
                    weakCategories: [],
                    suggestedDifficulty: 'easy',
                    categoryDistribution: ALL_CATEGORIES,
                    categoryPerformance: {},
                    mode: 'normal'
                }
            });
        }

        let totalScore = 0;
        let totalQuestions = 0;

        const categoryStats = {};

        const allQuestionIds = results.flatMap(r =>
            r.answers.map(a => a.questionId)
        );

        const questions = await QuizQuestion.find({
            _id: { $in: allQuestionIds }
        });

        const questionMap = {};
        questions.forEach(q => {
            questionMap[q._id] = q;
        });

        for (const result of results) {
            totalScore += result.score;
            totalQuestions += result.totalQuestions;

            for (const ans of result.answers) {
                const question = questionMap[ans.questionId];
                if (!question) continue;

                const category = question.category || 'general';

                if (!categoryStats[category]) {
                    categoryStats[category] = { correct: 0, total: 0 };
                }

                categoryStats[category].total += 1;
                if (ans.isCorrect) {
                    categoryStats[category].correct += 1;
                }
            }
        }

        const averageScore = totalScore / results.length;

        const categoryPerformance = {};
        ALL_CATEGORIES.forEach(cat => {
            const stats = categoryStats[cat];
            categoryPerformance[cat] = stats
                ? stats.correct / stats.total
                : 1;
        });

        const weakCategories = ALL_CATEGORIES.filter(
            cat => categoryPerformance[cat] < 0.6
        );

        const accuracyOverall = totalQuestions ? totalScore / totalQuestions : 0;

        let suggestedDifficulty = 'easy';
        if (accuracyOverall >= 0.8) suggestedDifficulty = 'hard';
        else if (accuracyOverall >= 0.5) suggestedDifficulty = 'medium';

        // 🎯 CHALLENGE MODE
        const mode = accuracyOverall >= 0.8 ? 'challenge' : 'normal';

        const TOTAL_QUESTIONS = 15;
        const distribution = [];

        const sortedCategories = [...ALL_CATEGORIES].sort((a, b) => {
            return categoryPerformance[a] - categoryPerformance[b];
        });

        const weights = sortedCategories.map(cat => ({
            category: cat,
            weight: Math.max(0.1, 1 - categoryPerformance[cat])
        }));

        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

        weights.forEach(w => {
            const count = Math.round((w.weight / totalWeight) * TOTAL_QUESTIONS);
            for (let i = 0; i < count; i++) {
                distribution.push(w.category);
            }
        });

        while (distribution.length < TOTAL_QUESTIONS) {
            distribution.push(sortedCategories[0]);
        }

        const categoryDistribution = distribution.slice(0, TOTAL_QUESTIONS);

        res.status(200).json({
            success: true,
            data: {
                averageScore,
                totalAttempts: results.length,
                weakCategories,
                suggestedDifficulty,
                categoryDistribution,
                categoryPerformance,
                mode
            }
        });

    } catch (error) {
        console.error("ANALYTICS ERROR:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ================= LEADERBOARD =================
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ xp: -1 })
            .limit(10)
            .select('name xp streak');

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error("LEADERBOARD ERROR:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const explainAnswers = async (req, res) => {
    try {
        const { answers } = req.body;

        if (!answers || !answers.length) {
            return res.status(400).json({
                success: false,
                message: "Answers required"
            });
        }

        const questionIds = answers.map(a => a.questionId);

        const questions = await QuizQuestion.find({
            _id: { $in: questionIds }
        });

        const formatted = questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
        }));

        const aiRes = await axios.post(
            `${process.env.AI_SERVICE_URL}/explain-answers`,
            { questions: formatted }
        );

        res.status(200).json(aiRes.data);

    } catch (error) {
        console.error("EXPLAIN ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to generate explanations"
        });
    }
};

const generateQuizQuestions = async (req, res) => {
    try {
        const { questions } = req.body;

        if (!questions || !questions.length) {
            return res.status(400).json({
                success: false,
                message: "No questions provided"
            });
        }

        // ✅ Remove duplicates
        const existing = await QuizQuestion.find({
            question: { $in: questions.map(q => q.question) }
        });

        const existingSet = new Set(existing.map(q => q.question));

        const newQuestions = questions.filter(
            q => !existingSet.has(q.question)
        );

        if (!newQuestions.length) {
            return res.status(200).json({
                success: true,
                message: "No new questions to insert"
            });
        }

        await QuizQuestion.insertMany(newQuestions);

        res.status(201).json({
            success: true,
            inserted: newQuestions.length
        });

    } catch (error) {
        console.error("GENERATE SAVE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
module.exports = {
    getQuizQuestions,
    submitQuiz,
    getUserResults,
    getUserQuizAnalytics,
    getLeaderboard,
    explainAnswers,
    generateQuizQuestions
};