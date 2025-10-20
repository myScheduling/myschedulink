const express = require('express');
const router = express.Router();
const { 
    getMyUnavailabilities, 
    createUnavailability, 
    deleteUnavailability 
} = require('../controllers/unavailabilityController');
const { protect } = require('../middleware/authMiddleware');

// Όλα τα routes είναι protected (μόνο για authenticated professionals)
router.get('/', protect, getMyUnavailabilities);
router.post('/', protect, createUnavailability);
router.delete('/:id', protect, deleteUnavailability);

module.exports = router;