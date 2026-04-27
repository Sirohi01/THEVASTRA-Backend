require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./modules/product/category.model');
const Product = require('./modules/product/product.model');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to seed database...');

        await Category.deleteMany();
        await Product.deleteMany();

        const categories = await Category.insertMany([
            { name: 'Sarees', slug: 'sarees' },
            { name: 'Lehengas', slug: 'lehengas' },
            { name: 'Fusion Wear', slug: 'fusion-wear' }
        ]);

        const products = [
            {
                name: 'Royal Silk Saree',
                slug: 'royal-silk-saree',
                description: 'A masterpiece of silk and gold zari work.',
                category: categories[0]._id,
                basePrice: 15000,
                images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1974&auto=format&fit=crop', public_id: 'sample1' }],
                variants: [
                    { size: 'Free Size', color: 'Royal Blue', price: 15000, stock: 10 }
                ]
            },
            {
                name: 'Golden Bridal Lehenga',
                slug: 'golden-bridal-lehenga',
                description: 'Luxury velvet lehenga with heavy embroidery.',
                category: categories[1]._id,
                basePrice: 45000,
                images: [{ url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1974&auto=format&fit=crop', public_id: 'sample2' }],
                variants: [
                    { size: 'M', color: 'Gold', price: 45000, stock: 5 },
                    { size: 'L', color: 'Gold', price: 46000, stock: 3 }
                ]
            }
        ];

        await Product.insertMany(products);
        console.log('✅ Seeding complete!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
