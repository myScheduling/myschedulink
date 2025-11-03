// backend/routes/authRoutes.js
const express = require('express');
const { loginWithGoogle, googleCallback } = require('../controllers/authController');
const router = express.Router();

// Route #1: Όταν ο χρήστης πατάει "Login", τον στέλνουμε στη Google
router.get('/google', loginWithGoogle);

// Route #2: Εδώ τον γυρνάει πίσω η Google αφού δώσει την άδεια
router.get('/google/callback', googleCallback);

module.exports = router; 

