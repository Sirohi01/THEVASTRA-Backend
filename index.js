require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://thevastrahouse.netlify.app',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // Temporarily allow all for debugging or use strict list
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/catalog', require('./modules/product/product.routes'));
app.use('/api/cms', require('./modules/cms/cms.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/payment', require('./modules/payment/payment.routes'));
app.use('/api/order', require('./modules/order/order.routes'));
app.use('/api/coupon', require('./modules/coupon/coupon.routes'));
app.use('/api/public-settings', require('./modules/cms/public-settings.routes'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Root Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to TheVastraHouse API' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Image size too large. Please use a file under 50MB.' });
    }
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
