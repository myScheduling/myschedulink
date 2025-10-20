// backend/controllers/userController.js
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get current user data
// @route   GET /api/users/me
// @access  Private

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.displayName = req.body.displayName || user.displayName;
            user.businessName = req.body.businessName || user.businessName;
            user.address = req.body.address || user.address;
            user.phone = req.body.phone || user.phone;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                displayName: updatedUser.displayName,
                businessName: updatedUser.businessName,
                address: updatedUser.address,
                phone: updatedUser.phone,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMe = async (req, res) => {
    // Το req.user υπάρχει χάρη στο middleware που έτρεξε πριν!
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const updateWorkingHours = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Παίρνουμε το νέο ωράριο από το σώμα του αιτήματος
        const { workingHours } = req.body;

        // Ενημερώνουμε το πεδίο και αποθηκεύουμε τον χρήστη
        user.workingHours = workingHours;
        await user.save();

        res.status(200).json(user.workingHours);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        // Βρίσκουμε τον χρήστη με βάση το ID από το URL
       const user = await User.findById(req.params.id).select('displayName businessName address phone');

        if (!user) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        // Βρίσκουμε τις υπηρεσίες που ανήκουν σε αυτόν τον χρήστη
        const services = await Service.find({ user: req.params.id });

        // Επιστρέφουμε μόνο τις δημόσιες πληροφορίες
        res.status(200).json({
            displayName: user.displayName,
            businessName: user.businessName,
            address: user.address,
            phone: user.phone,
            services: services,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Λήγει το cookie αμέσως
    });
    res.status(200).json({ message: 'User logged out successfully' });
};

module.exports = {
    getMe,
    updateWorkingHours,
    getPublicProfile, 
    updateUserProfile,
    logoutUser,
};