const Product = require('../product/product.model');

exports.decreaseStock = async (orderItems) => {
    try {
        const bulkOps = orderItems.map((item) => {
            return {
                updateOne: {
                    filter: { 
                        _id: item.product,
                        "variants.size": item.variant.size,
                        "variants.color": item.variant.color
                    },
                    update: { $inc: { "variants.$.stock": -item.quantity } }
                }
            };
        });

        await Product.bulkWrite(bulkOps);
    } catch (error) {
        console.error('Inventory Sync Error:', error);
    }
};
