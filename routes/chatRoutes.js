const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getChats,
    getChatById,
    deleteChat
} = require('../controllers/chatController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, sendMessage);
router.get('/', authMiddleware, getChats);
router.get('/:id', authMiddleware, getChatById);
router.delete('/:id', authMiddleware, deleteChat);
module.exports = router;