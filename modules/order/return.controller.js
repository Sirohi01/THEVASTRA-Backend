const Order = require('./order.model');

exports.requestReturn = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ message: 'Only delivered orders can be returned' });
        }

        order.orderStatus = 'Returned';
        // In a real app, you would add a 'returnRequest' object with reason and status
        await order.save();

        res.status(200).json({ success: true, message: 'Return request submitted' });
    } catch (error) {
        next(error);
    }
};
