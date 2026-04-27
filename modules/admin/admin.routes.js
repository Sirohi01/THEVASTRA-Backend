const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { protect, admin } = require('../../middlewares/auth.middleware');

const settingsController = require('./settings.controller');

router.get('/stats', protect, admin, adminController.getDashboardStats);
router.get('/users', protect, admin, settingsController.getUsers);
router.get('/settings', protect, admin, settingsController.getSettings);
router.put('/settings', protect, admin, settingsController.updateSettings);

module.exports = router;
