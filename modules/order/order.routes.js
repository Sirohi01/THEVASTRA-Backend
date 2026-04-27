const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { protect, admin } = require('../../middlewares/auth.middleware');

router.post('/', protect, orderController.createOrder);
router.get('/myorders', protect, orderController.getMyOrders);
router.get('/all', protect, admin, orderController.getAllOrders);
router.get('/:id', protect, orderController.getOrderById);
router.get('/:id/invoice', protect, orderController.downloadInvoice);
router.post('/:id/return', protect, orderController.requestReturn);
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router;
