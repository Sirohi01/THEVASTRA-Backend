const express = require('express');
const router = express.Router();
const cmsController = require('./cms.controller');
const { protect, admin } = require('../../middlewares/auth.middleware');

// Public CMS Routes
router.get('/banners', cmsController.getBanners);
router.get('/content/:key', cmsController.getContentByKey);

// Admin CMS Routes
router.post('/banners', protect, admin, cmsController.createBanner);
router.delete('/banners/:id', protect, admin, cmsController.deleteBanner);
router.post('/content', protect, admin, cmsController.updateContent);

// Inquiries
router.post('/inquiries', cmsController.createInquiry);
router.get('/inquiries', protect, admin, cmsController.getInquiries);
router.delete('/inquiries/:id', protect, admin, cmsController.deleteInquiry);

module.exports = router;
