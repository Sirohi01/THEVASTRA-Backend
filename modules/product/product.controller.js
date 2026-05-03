const Product = require('./product.model');
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
            name,
            slug,
            description,
            category,
            basePrice,
            variants,
            images,
            tags,
            metadata,
            isFeatured: isFeatured || false,
            isNewArrival: isNewArrival || false
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
        const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        let { name, image, images, stock, sku, variants, basePrice } = req.body;
        
        // Handle image uploads
        if (image && image.startsWith('data:image')) {
            const uploaded = await uploadToCloudinary(image, 'products');
            req.body.images = [uploaded];
            delete req.body.image;
        }

        // Handle sku and stock updates if they are at root
        if ((sku || stock !== undefined) && (!variants || variants.length === 0)) {
            const product = await Product.findById(req.params.id);
            if (product && product.variants && product.variants.length > 0) {
                const updatedVariants = [...product.variants];
                updatedVariants[0].sku = sku || updatedVariants[0].sku;
                updatedVariants[0].stock = stock !== undefined ? stock : updatedVariants[0].stock;
                updatedVariants[0].price = basePrice || updatedVariants[0].price;
                req.body.variants = updatedVariants;
            } else {
                 req.body.variants = [{
                    size: 'Standard',
                    color: 'Default',
                    sku: sku || `SKU-${Date.now()}`,
                    stock: stock || 0,
                    price: basePrice || 0
                }];
            }
        }

        if (name) {
            req.body.slug = slugify(name, { lower: true });
        }

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
