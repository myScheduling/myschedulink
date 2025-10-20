const mongoose = require('mongoose');

const UnavailabilitySchema = new mongoose.Schema({
    professional: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // Τύπος unavailability
    type: { 
        type: String, 
        enum: ['full-day', 'time-slot', 'recurring'], 
        required: true 
    },
    
    // Για full-day blocks (διακοπές, ρεπό)
    date: { 
        type: Date 
    },
    
    // Για time-slot blocks (break, meeting)
    startTime: { 
        type: Date 
    },
    endTime: { 
        type: Date 
    },
    
    // Για recurring blocks
    recurringDay: { 
        type: String, 
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    recurringStartTime: { 
        type: String // Format: "14:00"
    },
    recurringEndTime: { 
        type: String // Format: "15:00"
    },
    
    // Metadata
    reason: { 
        type: String 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

// Indexes για performance
UnavailabilitySchema.index({ professional: 1, date: 1 });
UnavailabilitySchema.index({ professional: 1, startTime: 1, endTime: 1 });
UnavailabilitySchema.index({ professional: 1, recurringDay: 1 });

// Validation
UnavailabilitySchema.pre('save', function(next) {
    if (this.type === 'full-day' && !this.date) {
        return next(new Error('Date is required for full-day unavailability'));
    }
    if (this.type === 'time-slot' && (!this.startTime || !this.endTime)) {
        return next(new Error('Start and end times are required for time-slot unavailability'));
    }
    if (this.type === 'recurring' && (!this.recurringDay || !this.recurringStartTime || !this.recurringEndTime)) {
        return next(new Error('Recurring details are required for recurring unavailability'));
    }
    next();
});

module.exports = mongoose.model('Unavailability', UnavailabilitySchema);