const apiKeyMiddleware = (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid API key'
            });
        }

        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = apiKeyMiddleware;