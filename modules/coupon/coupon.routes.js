const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller');
const { protect, admin } = require('../../middlewares/auth.middleware');

router.get('/', protect, admin, couponController.getAllCoupons);
router.post('/validate', protect, couponController.validateCoupon);
router.post('/', protect, admin, couponController.createCoupon);

module.exports = router;
