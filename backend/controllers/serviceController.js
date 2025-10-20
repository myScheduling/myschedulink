// backend/controllers/serviceController.js
const Service = require('../models/Service');

// @desc    Get services for logged in user
// @route   GET /api/services
// @access  Private
const getServices = async (req, res) => {
    const services = await Service.find({ user: req.user.id });
    res.status(200).json(services);
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
    const { name, duration, price } = req.body;

    if (!name || !duration) {
        return res.status(400).json({ message: 'Please provide name and duration' });
    }

    const service = await Service.create({
        name,
        duration,
        price,
        user: req.user.id // Συνδέουμε την υπηρεσία με τον συνδεδεμένο χρήστη
    });

    res.status(201).json(service);
};

// (Θα προσθέσουμε τις update/delete αργότερα για να το κρατήσουμε απλό)

module.exports = {
    getServices,
    createService,
};