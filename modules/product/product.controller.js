const Product = require('./product.model');
const mongoose = require('mongoose');
const slugify = require('slugify');
const { uploadToCloudinary } = require('../../utils/cloudinary');

exports.createProduct = async (req, res, next) => {
    try {
        let { name, description, category, basePrice, variants, images, image, stock, sku, tags, metadata, isFeatured, isNewArrival } = req.body;
        const slug = slugify(name, { lower: true });

        // Handle single image from frontend if sent as 'image'
        if (image && (!images || images.length === 0)) {
            const uploadedImage = await uploadToCloudinary(image, 'products');
            images = [uploadedImage];
        } else if (images && images.length > 0) {
            // Process images array if they are base64
            const processedImages = [];
            for (const img of images) {
                if (typeof img === 'string' && img.startsWith('data:image')) {
                    const uploaded = await uploadToCloudinary(img, 'products');
                    processedImages.push(uploaded);
                } else {
                    processedImages.push(img);
                }
            }
            images = processedImages;
        }

        // Handle sku and stock if sent at root (legacy or simplified frontend)
        if (!variants || variants.length === 0) {
            variants = [{
                size: 'Standard',
                color: 'Default',
                sku: sku || `SKU-${Date.now()}`,
                stock: stock || 0,
                price: basePrice
            }];
        }

        const product = await Product.create({
            name, slug, description, category, basePrice, variants, images, tags, metadata,
            isFeatured: isFeatured === true || isFeatured === 'true',
            isNewArrival: isNewArrival === true || isNewArrival === 'true'
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

        // Handle "discount" sort - products with discountPrice in any variant
        if (sort === 'discount') {
            query['variants.discountPrice'] = { $exists: true, $ne: null };
        }

        const skip = (page - 1) * limit;
        
        let sortQuery = { createdAt: -1 };
        if (sort === 'price-low') sortQuery = { basePrice: 1 };
        if (sort === 'price-high') sortQuery = { basePrice: -1 };
        if (sort === 'featured') sortQuery = { isFeatured: -1, createdAt: -1 };
        if (sort === 'newest') sortQuery = { isNewArrival: -1, createdAt: -1 };
        if (sort === 'discount') sortQuery = { 'variants.discountPrice': 1 }; // Or some other logic

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
        const { slug } = req.params;
        let product = await Product.findOne({ slug }).populate('category', 'name');
        
        // Fallback: If not found by slug, try finding by ID (in case ID was passed)
        if (!product && mongoose.Types.ObjectId.isValid(slug)) {
            product = await Product.findById(slug).populate('category', 'name');
        }

        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const { name, description, category, basePrice, variants, images, isFeatured, isNewArrival, tags, metadata } = req.body;
        const updateData = {};

        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name, { lower: true });
        }
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (basePrice !== undefined) updateData.basePrice = basePrice;
        if (tags) updateData.tags = tags;
        if (metadata) updateData.metadata = metadata;
        
        // Handle flags explicitly
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured === true || isFeatured === 'true';
        if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival === true || isNewArrival === 'true';

        // Process variants to ensure numbers
        if (variants && variants.length > 0) {
            updateData.variants = variants.map(v => ({
                size: v.size,
                color: v.color,
                sku: v.sku,
                stock: Number(v.stock) || 0,
                price: Number(v.price) || 0,
                discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined
            }));
        }

        // Image handling (already in req.body.images if processed by middleware or frontend)
        if (images) updateData.images = images;

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
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
