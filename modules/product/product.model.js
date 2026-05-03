const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size: { type: String, required: true },
    color: { type: String, required: true },
    sku: { type: String, unique: true },
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }],
    variants: [variantSchema],
    basePrice: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [String],
    metadata: {
        title: String,
        description: String
    }
}, { timestamps: true });

// Index for search optimization
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
