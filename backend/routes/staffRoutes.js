const express = require('express');
const router = express.Router();
const { 
    getMyStaff, 
    getStaffById, 
    createStaff, 
    updateStaff, 
    deleteStaff,
    getPublicStaff
} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (για τον business owner)
router.get('/', protect, getMyStaff);
router.get('/:id', protect, getStaffById);
router.post('/', protect, createStaff);
router.put('/:id', protect, updateStaff);
router.delete('/:id', protect, deleteStaff);

// Public route (για booking page)
router.get('/public/:professionalId', getPublicStaff);

module.exports = router;