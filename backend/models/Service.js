// backend/models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Σύνδεση με το μοντέλο User
    },
    name: {
        type: String,
        required: [true, 'Please add a service name']
    },
    duration: {
        type: Number,
        required: [true, 'Please add a duration in minutes']
    },
    price: {
        type: Number,
        required: false // Το κάνουμε προαιρετικό
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema); 
