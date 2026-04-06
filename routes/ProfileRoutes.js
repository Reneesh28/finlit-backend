const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const { setFinancialProfile, getFinancialProfile } = require('../controllers/ProfileController');

router.post('/', protect, setFinancialProfile);
router.get('/', protect, getFinancialProfile);

module.exports = router;