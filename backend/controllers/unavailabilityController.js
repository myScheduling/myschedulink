const Unavailability = require('../models/Unavailability');

// Get all unavailabilities για τον επαγγελματία
const getMyUnavailabilities = async (req, res) => {
    try {
        const professionalId = req.user._id;
        
        const unavailabilities = await Unavailability.find({ 
            professional: professionalId,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json(unavailabilities);
    } catch (error) {
        console.error('Error fetching unavailabilities:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create new unavailability
const createUnavailability = async (req, res) => {
    try {
        const professionalId = req.user._id;
        const { type, date, startTime, endTime, recurringDay, recurringStartTime, recurringEndTime, reason } = req.body;

        // Validation based on type
        if (type === 'full-day' && !date) {
            return res.status(400).json({ message: 'Date is required for full-day block' });
        }
        if (type === 'time-slot' && (!startTime || !endTime)) {
            return res.status(400).json({ message: 'Start and end times are required for time-slot block' });
        }
        if (type === 'recurring' && (!recurringDay || !recurringStartTime || !recurringEndTime)) {
            return res.status(400).json({ message: 'Recurring details are required for recurring block' });
        }

        const unavailability = await Unavailability.create({
            professional: professionalId,
            type,
            date: type === 'full-day' ? new Date(date) : undefined,
            startTime: type === 'time-slot' ? new Date(startTime) : undefined,
            endTime: type === 'time-slot' ? new Date(endTime) : undefined,
            recurringDay,
            recurringStartTime,
            recurringEndTime,
            reason
        });

        res.status(201).json(unavailability);
    } catch (error) {
        console.error('Error creating unavailability:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete unavailability
const deleteUnavailability = async (req, res) => {
    try {
        const { id } = req.params;
        const professionalId = req.user._id;

        const unavailability = await Unavailability.findOne({ 
            _id: id, 
            professional: professionalId 
        });

        if (!unavailability) {
            return res.status(404).json({ message: 'Unavailability not found' });
        }

        unavailability.isActive = false;
        await unavailability.save();

        res.json({ message: 'Unavailability removed successfully' });
    } catch (error) {
        console.error('Error deleting unavailability:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMyUnavailabilities,
    createUnavailability,
    deleteUnavailability
};