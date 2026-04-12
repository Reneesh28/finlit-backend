const asyncHandler = require('express-async-handler');
const APIUsage = require('../models/apiUsage');
const { sendMessageToAI } = require('../services/aiService');
const ChatHistory = require('../models/chatHistory');

// 🔢 Token estimation helper
const estimateTokens = (text) => {
    return Math.ceil(text.split(/\s+/).length * 1.3);
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

    // Reset if new day
    if (usage.lastRequestDate?.toISOString().split('T')[0] !== today) {
        usage.requestsToday = 0;
        usage.tokensToday = 0;
    }

    // 🚦 Request limit
    if (usage.requestsToday >= 50) {
        res.status(429);
        throw new Error('Daily limit reached');
    }

    // 🔢 Token limit (7500/day)
    if (usage.tokensToday >= 7500) {
        res.status(429);
        throw new Error('Daily token limit reached');
    }
    // =====================================================

    const aiResponse = await sendMessageToAI(message);

    // 🔢 Token calculation
    const inputTokens = estimateTokens(message);
    const outputTokens = estimateTokens(aiResponse);
    const totalTokens = inputTokens + outputTokens;

    // 🔢 Prevent overflow in same request
    if (usage.tokensToday + totalTokens > 7500) {
        res.status(429);
        throw new Error('Token limit exceeded for today');
    }

    let chat;

    // ✅ Existing chat
    if (chatId) {
        chat = await ChatHistory.findById(chatId);

        if (!chat) {
            res.status(404);
            throw new Error('Chat not found');
        }

        chat.messages.push(
            { role: 'user', content: message, tokensUsed: inputTokens },
            { role: 'assistant', content: aiResponse, tokensUsed: outputTokens }
        );

        await chat.save();
    }
    // ✅ New chat
    else {
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

    // 📊 Monthly tracking
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

module.exports = {
    sendMessage
};