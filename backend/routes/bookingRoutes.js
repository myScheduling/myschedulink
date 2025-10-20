const express = require('express');
const router = express.Router();
const { 
    getAvailability, 
    createBooking, 
    getBookingByToken, 
    cancelBooking,
    getMyBookings,
    getBookingStats,
    cancelBookingByProfessional
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/availability', getAvailability);
router.post('/', createBooking);
router.get('/cancel/:token', getBookingByToken);
router.post('/cancel/:token', cancelBooking);

// 🆕 Protected routes (για τον επαγγελματία)
router.get('/my-bookings', protect, getMyBookings);
router.get('/stats', protect, getBookingStats);
router.post('/:bookingId/cancel', protect, cancelBookingByProfessional);

module.exports = router;