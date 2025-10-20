const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    bio: { type: String, maxlength: 500 },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    workingHours: {
        monday: [{ start: String, end: String }],
        tuesday: [{ start: String, end: String }],
        wednesday: [{ start: String, end: String }],
        thursday: [{ start: String, end: String }],
        friday: [{ start: String, end: String }],
        saturday: [{ start: String, end: String }],
        sunday: [{ start: String, end: String }]
    },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

StaffSchema.index({ business: 1, isActive: 1 });

module.exports = mongoose.model('Staff', StaffSchema);