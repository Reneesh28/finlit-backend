const asyncHandler = require('express-async-handler');
const APIUsage = require('../models/apiUsage');
const { sendMessageToAI } = require('../services/aiService');
const ChatHistory = require('../models/chatHistory');
const FinancialProfile = require('../models/financialProfile');
const Transaction = require('../models/transaction');

// 🔢 Token estimation helper
const estimateTokens = (text) => {
    return Math.ceil(text.split(/\s+/).length * 1.3);
};

// ✂️ Limit history (last N messages)
const trimHistory = (messages, limit = 10) => {
    if (!messages) return [];
    return messages.slice(-limit);
};

// 🧠 Build financial context
const buildFinancialContext = async (userId) => {
    const profile = await FinancialProfile.findOne({ user: userId });

    const transactions = await Transaction.find({ user: userId })
        .sort({ date: -1 })
        .limit(5);

    return {
        profile: profile
            ? {
                monthlyIncome: profile.monthlyIncome,
                savingsGoal: profile.savingsGoal,
                fixedExpenses: profile.fixedExpenses,
                variableExpenses: profile.variableExpenses,
                financialHealthScore: profile.financialHealthScore
            }
            : null,
        recentTransactions: transactions.map((t) => ({
            type: t.type,
            amount: t.amount,
            category: t.category
        }))
    };
};

const sendMessage = asyncHandler(async (req, res) => {
    const { message, chatId, title } = req.body;
    const userId = req.user._id;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    // 🔐 ================= API USAGE CHECK =================
    let usage = await APIUsage.findOne({ user: userId });

    const today = new Date().toISOString().split('T')[0];

    if (!usage) {
        usage = await APIUsage.create({
            user: userId,
            requestsToday: 0,
            tokensToday: 0,
            lastRequestDate: new Date(),
            monthlyUsage: []
        });
    }

    if (usage.lastRequestDate?.toISOString().split('T')[0] !== today) {
        usage.requestsToday = 0;
        usage.tokensToday = 0;
    }

    if (usage.requestsToday >= 50) {
        res.status(429);
        throw new Error('Daily limit reached');
    }

    if (usage.tokensToday >= 7500) {
        res.status(429);
        throw new Error('Daily token limit reached');
    }
    // =====================================================

    let chat;
    let history = [];

    if (chatId) {
        chat = await ChatHistory.findById(chatId);

        if (!chat) {
            res.status(404);
            throw new Error('Chat not found');
        }

        if (chat.user.toString() !== userId.toString()) {
            res.status(403);
            throw new Error('Not authorized to access this chat');
        }

        history = trimHistory(chat.messages);
    }

    // 🧠 FETCH FINANCIAL CONTEXT
    const financialContext = await buildFinancialContext(userId);

    // 🤖 AI CALL WITH CONTEXT + USER DATA
    const aiResponse = await sendMessageToAI({
        message,
        history,
        financialContext
    });

    const inputTokens = estimateTokens(message);
    const outputTokens = estimateTokens(aiResponse);
    const totalTokens = inputTokens + outputTokens;

    if (usage.tokensToday + totalTokens > 7500) {
        res.status(429);
        throw new Error('Token limit exceeded for today');
    }

    if (chatId) {
        chat.messages.push(
            { role: 'user', content: message, tokensUsed: inputTokens },
            { role: 'assistant', content: aiResponse, tokensUsed: outputTokens }
        );

        await chat.save();
    } else {
        chat = await ChatHistory.create({
            user: userId,
            title: title || 'New Chat',
            messages: [
                { role: 'user', content: message, tokensUsed: inputTokens },
                { role: 'assistant', content: aiResponse, tokensUsed: outputTokens }
            ]
        });
    }

    // 🔐 ================= USAGE UPDATE =================
    usage.requestsToday += 1;
    usage.tokensToday += totalTokens;
    usage.lastRequestDate = new Date();

    const currentMonth = new Date().toISOString().slice(0, 7);

    let monthData = usage.monthlyUsage.find(m => m.month === currentMonth);

    if (!monthData) {
        usage.monthlyUsage.push({
            month: currentMonth,
            totalRequests: 1,
            totalTokens: totalTokens
        });
    } else {
        monthData.totalRequests += 1;
        monthData.totalTokens += totalTokens;
    }

    await usage.save();
    // ==================================================

    res.status(200).json({
        chatId: chat._id,
        response: aiResponse
    });
});

const getChats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const chats = await ChatHistory.find({ user: userId })
        .select('_id title lastUpdated')
        .sort({ lastUpdated: -1 });

    res.status(200).json(chats);
});

const getChatById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const chat = await ChatHistory.findById(id);

    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    if (chat.user.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this chat');
    }

    res.status(200).json(chat);
});

const deleteChat = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const chat = await ChatHistory.findById(id);

    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    if (chat.user.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this chat');
    }

    await chat.deleteOne();

    res.status(200).json({ message: 'Chat deleted successfully' });
});

module.exports = {
    sendMessage,
    getChats,
    getChatById,
    deleteChat
};