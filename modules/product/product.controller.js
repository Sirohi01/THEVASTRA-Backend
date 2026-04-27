const Product = require('./product.model');
const slugify = require('slugify');

exports.createProduct = async (req, res, next) => {
    try {
        const { name, description, category, basePrice, variants, images, tags, metadata } = req.body;
        const slug = slugify(name, { lower: true });

        const product = await Product.create({
            name,
            slug,
            description,
            category,
            basePrice,
            variants,
            images,
            tags,
            metadata
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const { category, search, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (search) {
            query.$text = { $search: search };
        }
        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice) query.basePrice.$gte = Number(minPrice);
            if (maxPrice) query.basePrice.$lte = Number(maxPrice);
        }

        const skip = (page - 1) * limit;
        
        let sortQuery = { createdAt: -1 };
        if (sort === 'price-low') sortQuery = { basePrice: 1 };
        if (sort === 'price-high') sortQuery = { basePrice: -1 };

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            pages: Math.ceil(total / limit),
            products
        });
    } catch (error) {
        next(error);
    }
};

exports.getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product removed' });
    } catch (error) {
        next(error);
    }
};
