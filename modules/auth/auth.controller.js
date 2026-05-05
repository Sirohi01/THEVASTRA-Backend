const User = require('./user.model');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ firstName, lastName, email, password });
        const accessToken = generateToken(user._id);

        res.status(201).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    res.status(410).json({ message: 'Refresh tokens are no longer used. Please login again if needed.' });
};

const Order = require('../order/order.model');

exports.getProfileSummary = async (req, res, next) => {
    try {
        const orderCount = await Order.countDocuments({ user: req.user._id });
        const wishlistCount = req.user.wishlist.length;
        const addressCount = req.user.addresses.length;

        const recentOrders = await Order.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(3)
            .populate('items.product', 'name images');

        res.status(200).json({
            success: true,
            summary: {
                orderCount,
                wishlistCount,
                addressCount,
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await User.findById(req.user.id);
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        await user.save();
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'Recovery email sent' });
    } catch (error) {
        next(error);
    }
};
