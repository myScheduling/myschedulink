// backend/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { getServices, createService } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// Όλα τα παρακάτω routes προστατεύονται από το 'protect' middleware
router.route('/')
    .get(protect, getServices)
    .post(protect, createService);

module.exports = router; 
