const mongoose = require('mongoose');
const crypto = require('crypto');

const BookingSchema = new mongoose.Schema({
    professional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, 
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    
    // 🆕 ΝΕΑ ΠΕΔΙΑ
    status: { 
        type: String, 
        enum: ['confirmed', 'cancelled', 'completed', 'no-show'], 
        default: 'confirmed' 
    },
    googleEventId: { 
        type: String, 
        required: false 
    },
    cancellationToken: { 
        type: String, 
        sparse: true 
    },
    cancelledAt: { 
        type: Date 
    },
    cancellationReason: { 
        type: String 
    }
}, { timestamps: true });

// 🔐 Δημιουργία unique cancellation token πριν το save
BookingSchema.pre('save', function(next) {
    if (this.isNew && !this.cancellationToken) {
        this.cancellationToken = crypto.randomBytes(32).toString('hex');
    }
    next();
});

// 📊 Index για γρήγορη αναζήτηση
BookingSchema.index({ professional: 1, startTime: 1 });
BookingSchema.index({ cancellationToken: 1 });

module.exports = mongoose.model('Booking', BookingSchema);