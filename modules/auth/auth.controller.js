const User = require('./user.model');
const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ firstName, lastName, email, password });
        const { accessToken, refreshToken } = generateTokens(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, cookieOptions);

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

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, cookieOptions);

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
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: 'Refresh token not found' });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, cookieOptions);

        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({ success: true, accessToken });
    } catch (error) {
        res.status(403).json({ message: 'Refresh token expired' });
    }
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
        const token = req.cookies.refreshToken;
        if (token) {
            const user = await User.findOne({ refreshToken: token });
            if (user) {
                user.refreshToken = null;
                await user.save();
            }
        }
        res.clearCookie('refreshToken', cookieOptions);
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
