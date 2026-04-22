const express = require('express');
const router = express.Router();

const { getSpendingDistribution } = require('../controllers/insightController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getSpendingDistribution);

module.exports = router;