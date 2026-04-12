const axios = require('axios');

const AI_BASE_URL = 'http://127.0.0.1:8000/api/chat';

const sendMessageToAI = async (message) => {
    try {
        const response = await axios.post(
            AI_BASE_URL,
            { message },
            {
                headers: {
                    'x-api-key': process.env.INTERNAL_API_KEY
                }
            }
        );

        return response.data.response;
    } catch (error) {
        console.error('AI Service Error:', error.message);
        throw new Error('Failed to get AI response');
    }
};

module.exports = {
    sendMessageToAI
};