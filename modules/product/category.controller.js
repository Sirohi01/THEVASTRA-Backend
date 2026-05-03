const Category = require('./category.model');
const slugify = require('slugify');
const { uploadToCloudinary } = require('../../utils/cloudinary');

exports.createCategory = async (req, res, next) => {
    try {
        const { name, parentCategory, description, image } = req.body;
        const slug = slugify(name, { lower: true });
        
        let imageData = null;
        if (image) {
            imageData = await uploadToCloudinary(image, 'categories');
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image: imageData,
            parentCategory: parentCategory || null
        });

        res.status(201).json({ success: true, category });
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().populate('parentCategory', 'name');
        res.status(200).json({ success: true, categories });
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const { name, parentCategory, description, image, isActive } = req.body;
        const category = await Category.findById(req.params.id);
        
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (name) {
            category.name = name;
            category.slug = slugify(name, { lower: true });
        }
        if (description !== undefined) category.description = description;
        if (image && image.startsWith('data:image')) {
            category.image = await uploadToCloudinary(image, 'categories');
        }
        if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();
        res.status(200).json({ success: true, category });
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};
