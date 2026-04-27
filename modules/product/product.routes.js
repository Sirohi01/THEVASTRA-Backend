const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const categoryController = require('./category.controller');
const { protect, admin } = require('../../middlewares/auth.middleware');

// Category Routes
router.get('/categories', categoryController.getCategories);
router.post('/categories', protect, admin, categoryController.createCategory);
router.put('/categories/:id', protect, admin, categoryController.updateCategory);
router.delete('/categories/:id', protect, admin, categoryController.deleteCategory);

// Product Routes
router.get('/products', productController.getProducts);
router.get('/products/:slug', productController.getProductBySlug);
router.post('/products', protect, admin, productController.createProduct);
router.put('/products/:id', protect, admin, productController.updateProduct);
router.delete('/products/:id', protect, admin, productController.deleteProduct);

module.exports = router;
