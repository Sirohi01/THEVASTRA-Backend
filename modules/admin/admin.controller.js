const User = require('../auth/user.model');
const Product = require('../product/product.model');
const Order = require('../order/order.model');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // Calculate total revenue
        const orders = await Order.find({ isPaid: true });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Pending Shipments (Processing or Shipped)
        const pendingOrders = await Order.countDocuments({ 
            orderStatus: { $in: ['Processing', 'Shipped'] } 
        });

        // New Customers (Registered in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newCustomers = await User.countDocuments({ 
            role: 'user', 
            createdAt: { $gte: thirtyDaysAgo } 
        });

        // Sales by Month
        const salesByMonth = await Order.aggregate([
            { $match: { isPaid: true } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                newCustomers,
                pendingOrders,
                totalUsers,
                totalProducts
            },
            salesByMonth
        });
    } catch (error) {
        next(error);
    }
};
