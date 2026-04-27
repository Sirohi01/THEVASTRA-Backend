const { Banner, Content } = require('./cms.model');
const { uploadToCloudinary, removeFromCloudinary } = require('../../utils/cloudinary');

// Banner Management
exports.createBanner = async (req, res, next) => {
    try {
        const { title, subtitle, link, type, priority, image } = req.body;
        
        // Upload image if provided as base64
        const uploadResult = await uploadToCloudinary(image, 'banners');

        const banner = await Banner.create({
            title,
            subtitle,
            link,
            type,
            priority,
            imageUrl: uploadResult.url,
            public_id: uploadResult.public_id
        });

        res.status(201).json({ success: true, banner });
    } catch (error) {
        next(error);
    }
};

exports.getBanners = async (req, res, next) => {
    try {
        // Admins should see all banners, public only active ones
        const filter = req.query.admin === 'true' ? {} : { isActive: true };
        const banners = await Banner.find(filter).sort({ priority: -1 });
        res.status(200).json({ success: true, banners });
    } catch (error) {
        next(error);
    }
};

exports.deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        // Don't let Cloudinary errors stop the DB deletion
        try {
            if (banner.public_id && !banner.public_id.startsWith('seed/')) {
                await removeFromCloudinary(banner.public_id);
            }
        } catch (cloudinaryError) {
            console.error('Cloudinary delete failed:', cloudinaryError);
        }

        await banner.deleteOne();
        res.status(200).json({ success: true, message: 'Banner removed' });
    } catch (error) {
        next(error);
    }
};

// Static Content / CMS Pages
exports.updateContent = async (req, res, next) => {
    try {
        const { key, title, subtitle, content, headerImage } = req.body;
        
        let updateData = { key, title, subtitle, content };

        // Upload header image if it's a new base64 string
        if (headerImage && headerImage.startsWith('data:image')) {
            const uploadResult = await uploadToCloudinary(headerImage, 'cms');
            updateData.headerImage = uploadResult.url;
        }

        const updatedContent = await Content.findOneAndUpdate(
            { key },
            updateData,
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, content: updatedContent });
    } catch (error) {
        next(error);
    }
};

exports.getContentByKey = async (req, res, next) => {
    try {
        const content = await Content.findOne({ key: req.params.key });
        if (!content) return res.status(404).json({ message: 'Content not found' });
        res.status(200).json({ success: true, content });
    } catch (error) {
        next(error);
    }
};

// Inquiries
const Inquiry = require('./inquiry.model');

exports.createInquiry = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.create(req.body);
        res.status(201).json({ success: true, inquiry });
    } catch (error) {
        next(error);
    }
};

exports.getInquiries = async (req, res, next) => {
    try {
        const inquiries = await Inquiry.find().sort('-createdAt');
        res.status(200).json({ success: true, inquiries });
    } catch (error) {
        next(error);
    }
};

exports.deleteInquiry = async (req, res, next) => {
    try {
        await Inquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Inquiry deleted' });
    } catch (error) {
        next(error);
    }
};
