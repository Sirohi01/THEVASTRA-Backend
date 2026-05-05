const Order = require('./order.model');
const Product = require('../product/product.model');
const { decreaseStock } = require('../product/inventory.service');
const { generateInvoice } = require('../../utils/invoice.service');

exports.createOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, discountPrice, taxPrice, shippingPrice, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // 1. Validate Stock for all items
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) return res.status(404).json({ message: `Product ${item.name} not found` });
            
            const variant = product.variants.find(v => v.size === item.variant?.size && v.color === item.variant?.color);
            if (!variant) return res.status(400).json({ message: `Variant for ${item.name} not found` });
            
            if (variant.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name} (${item.variant.size}/${item.variant.color})` });
            }
        }

        // 2. Create Order
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            discountPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();

        // 3. For COD, decrease stock immediately
        if (paymentMethod === 'COD') {
            await decreaseStock(orderItems);
        }

        res.status(201).json({ success: true, order: createdOrder });
    } catch (error) {
        next(error);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, trackingNumber, trackingUrl } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.orderStatus = orderStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (trackingUrl) order.trackingUrl = trackingUrl;
        
        if (orderStatus === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

exports.downloadInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const pdfBase64 = await generateInvoice(order);
        res.status(200).json({ success: true, pdf: pdfBase64 });
    } catch (error) {
        next(error);
    }
};

exports.requestReturn = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ message: 'Only delivered orders can be returned' });
        }
        order.orderStatus = 'Returned';
        await order.save();
        res.status(200).json({ success: true, message: 'Return request processed' });
    } catch (error) {
        next(error);
    }
};
