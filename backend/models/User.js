// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    businessName: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    // Αυτά τα "tokens" είναι τα κλειδιά για να κάνουμε ενέργειες για λογαριασμό του χρήστη
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    workingHours: {
        type: Object,
        default: {
            monday: [],
            tuesday: [{ start: '09:00', end: '17:00' }],
            wednesday: [{ start: '09:00', end: '17:00' }],
            thursday: [{ start: '09:00', end: '17:00' }],
            friday: [{ start: '09:00', end: '17:00' }],
            saturday: [{ start: '10:00', end: '14:00' }],
            sunday: [],
        }
    }
}, { timestamps: true }); // Προσθέτει αυτόματα τα πεδία createdAt και updatedAt

module.exports = mongoose.model('User', UserSchema);
