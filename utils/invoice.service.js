const easyinvoice = require('easyinvoice');
const fs = require('fs');

exports.generateInvoice = async (order) => {
    const data = {
        "customize": {},
        "images": {
            "logo": "https://public.easyinvoice.cloud/img/logo_en_72x72.png",
        },
        "sender": {
            "company": "TheVastraHouse",
            "address": "123 Fashion Street, Sector 12",
            "zip": "110001",
            "city": "New Delhi",
            "country": "India"
        },
        "client": {
            "company": order.shippingAddress.fullName,
            "address": order.shippingAddress.addressLine1,
            "zip": order.shippingAddress.pincode,
            "city": order.shippingAddress.city,
            "country": "India"
        },
        "information": {
            "number": order._id.toString().slice(-6),
            "date": new Date(order.createdAt).toLocaleDateString(),
            "due-date": new Date(order.createdAt).toLocaleDateString()
        },
        "products": order.orderItems.map(item => ({
            "quantity": item.quantity,
            "description": item.name,
            "tax-rate": 18,
            "price": item.price
        })),
        "bottom-notice": "Thank you for shopping at TheVastraHouse. Elevate your elegance.",
        "settings": {
            "currency": "INR",
        }
    };

    const result = await easyinvoice.createInvoice(data);
    return result.pdf; // Base64 PDF
};
