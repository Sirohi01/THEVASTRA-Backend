const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (fileStr, folder) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            folder: `thevastrahouse/${folder}`,
            resource_type: 'auto'
        });
        return {
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id
        };
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Image upload failed');
    }
};

const removeFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }
};

module.exports = { uploadToCloudinary, removeFromCloudinary };
