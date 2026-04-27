const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String, required: true },
    public_id: { type: String, required: true },
    link: { type: String },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    type: { type: String, enum: ['hero', 'promotional', 'category'], default: 'hero' }
}, { timestamps: true });
const contentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    headerImage: { type: String },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = {
    Banner: mongoose.model('Banner', bannerSchema),
    Content: mongoose.model('Content', contentSchema)
};
