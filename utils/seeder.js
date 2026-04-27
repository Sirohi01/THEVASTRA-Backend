const mongoose = require('mongoose');
const User = require('../modules/auth/user.model');
const bcrypt = require('bcryptjs');
const Category = require('../modules/product/category.model');
const Product = require('../modules/product/product.model');
const { Banner, Content } = require('../modules/cms/cms.model');
const Settings = require('../modules/admin/settings.model');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for Massive Seeding...');

        // 1. Clear Old Data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Banner.deleteMany({});
        await Content.deleteMany({});
        await Settings.deleteMany({});

        // 1.5 Create Admin User
        const adminPassword = await bcrypt.hash('admin@123', 12);
        await User.create({
            firstName: 'Manish',
            lastName: 'Sirohi',
            email: 'manishsirohi023@gmail.com',
            password: 'admin@123', // Model hook will hash this
            role: 'admin',
            isVerified: true
        });
        console.log('✅ Admin User Created');

        // 2. Categories
        const categories = await Category.insertMany([
            { name: 'Banarasi Silk', slug: 'banarasi-silk', description: 'Traditional handwoven sarees from Varanasi' },
            { name: 'Bridal Lehengas', slug: 'bridal-lehengas', description: 'Handcrafted royal ensembles for your special day' },
            { name: 'Men\'s Sherwani', slug: 'mens-sherwani', description: 'Regal ethnic wear for the modern groom' },
            { name: 'Pashmina Shawls', slug: 'pashmina', description: 'Exquisite hand-embroidered wool from Kashmir' },
            { name: 'Fusion Wear', slug: 'fusion-wear', description: 'Ethnic elegance with a modern silhouette' }
        ]);

        // 3. Products
        await Product.insertMany([
            {
                name: 'Midnight Maroon Banarasi',
                slug: 'midnight-maroon-banarasi',
                description: 'Pure Katan Silk with intricate gold zari work across the border and pallu.',
                basePrice: 32000,
                category: categories[0]._id,
                images: [{ url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2', public_id: 'seed/p1' }],
                variants: [{ size: 'Standard', color: 'Maroon', price: 32000, stock: 5, sku: 'SKU-BN-001' }],
                isFeatured: true
            },
            {
                name: 'Royal Ivory Sherwani',
                slug: 'royal-ivory-sherwani',
                description: 'Hand-embroidered ivory silk sherwani with antique gold buttons.',
                basePrice: 45000,
                category: categories[2]._id,
                images: [{ url: 'https://images.unsplash.com/photo-1594187043532-97417b0ef535', public_id: 'seed/p2' }],
                variants: [{ size: 'L', color: 'Ivory', price: 45000, stock: 4, sku: 'SKU-SH-002' }],
                isFeatured: true
            }
        ]);

        // 4. Banners
        await Banner.insertMany([
            {
                title: 'The Wedding Archive',
                subtitle: 'Bridal Collection 2026',
                imageUrl: 'https://images.unsplash.com/photo-1610030469668-3010f368f54c',
                public_id: 'seed/b1',
                link: '/shop?category=bridal-lehengas',
                isActive: true,
                priority: 1
            }
        ]);

        // 5. CMS Content (Pages)
        await Content.insertMany([
            {
                key: 'about-us',
                title: 'Our Heritage',
                subtitle: 'Crafting elegance since 1985 with passion and tradition.',
                headerImage: 'https://images.unsplash.com/photo-1594187043532-97417b0ef535',
                content: `<h3>The Story of TheVastraHouse</h3><p>Founded on the principles of timeless elegance and masterful craftsmanship, TheVastraHouse has been the cornerstone of luxury ethnic wear for over three decades.</p>`
            },
            {
                key: 'contact',
                title: 'Concierge',
                subtitle: 'We are at your service for bespoke inquiries and personal styling.',
                headerImage: 'https://images.unsplash.com/photo-1594187043532-97417b0ef535',
                content: '<p>Please use the form below to reach out to our team.</p>'
            },
            {
                key: 'shop',
                title: 'The Royal Archive',
                subtitle: 'Explore our curated collections of handcrafted masterpieces.',
                headerImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2',
                content: '<p>Discover our exquisite range of ethnic wear, each piece telling a unique story of tradition and luxury.</p>'
            },
            {
                key: 'shipping-returns',
                title: 'Concierge & Logistics',
                subtitle: 'Seamless delivery to our global clientele.',
                headerImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
                content: '<h3>Global Shipping</h3><p>We deliver to over 150 countries with our premium logistics partners. Ready-to-wear pieces ship in 5-7 days.</p>'
            },
            {
                key: 'privacy-policy',
                title: 'Privacy & Trust',
                subtitle: 'Your security is our utmost priority.',
                headerImage: 'https://images.unsplash.com/photo-1557591953-97522d08a0cb',
                content: '<h3>Data Protection</h3><p>Your personal information is handled with the highest level of encryption and security.</p>'
            }
        ]);

        // 6. Settings
        await Settings.create({
            siteName: 'TheVastraHouse',
            footerDescription: 'Elevating Indian heritage through premium handcrafted ethnic wear designed for the modern royalty.',
            address: '123 Fashion Street, Sector 12, New Delhi, India',
            phone: '+91 98765 43210',
            email: 'concierge@thevastrahouse.com',
            socialLinks: {
                instagram: 'https://instagram.com/thevastrahouse',
                facebook: 'https://facebook.com/thevastrahouse'
            }
        });

        console.log('Database Massive Seeding Successful! 👑🌱');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
