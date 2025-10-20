const express = require('express');
const router = express.Router();

// Μία και μοναδική γραμμή που εισάγει ΟΛΕΣ τις συναρτήσεις
const { getMe, updateWorkingHours, getPublicProfile, updateUserProfile, logoutUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// --- Routes ---

// @desc    Get current user data (Private)
router.get('/me', protect, getMe);

// @desc    Update user working hours (Private)
router.put('/working-hours', protect, updateWorkingHours);

// @desc    Update user profile details (Private)
router.put('/profile', protect, updateUserProfile);

// @desc    Get a professional's public profile (Public)
router.get('/:id/public', getPublicProfile);

router.post('/logout', protect, logoutUser);

module.exports = router;