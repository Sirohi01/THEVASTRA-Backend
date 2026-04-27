const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, updateProfile } = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', require('./auth.controller').forgotPassword);
router.put('/profile', protect, updateProfile);
router.get('/profile/summary', protect, require('./auth.controller').getProfileSummary);

module.exports = router;
