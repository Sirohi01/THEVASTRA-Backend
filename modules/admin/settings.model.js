const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: { type: String, default: "TheVastraHouse" },
    footerDescription: { type: String, default: "Elevating Indian heritage through premium handcrafted ethnic wear." },
    address: { type: String, default: "123 Fashion Street, Sector 12, New Delhi, India" },
    phone: { type: String, default: "+91 98765 43210" },
    email: { type: String, default: "concierge@thevastrahouse.com" },
    socialLinks: {
        instagram: String,
        facebook: String,
        twitter: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
