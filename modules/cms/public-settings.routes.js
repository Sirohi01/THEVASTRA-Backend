const express = require('express');
const router = express.Router();
const settingsController = require('../admin/settings.controller');

router.get('/', settingsController.getSettings);

module.exports = router;
