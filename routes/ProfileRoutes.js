const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const {
    setFinancialProfile,
    getFinancialProfile
} = require('../controllers/ProfileController');

const { validateProfile, validate } = require('../middleware/validationMiddleware');

router.post('/', protect, validateProfile, validate, setFinancialProfile);
router.get('/', protect, getFinancialProfile);

module.exports = router;