// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 🔥 ΔΙΟΡΘΩΣΗ: Ελέγχουμε και τα cookies ΚΑΙ το Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Παίρνουμε το token από το Authorization header
            // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            token = req.headers.authorization.split(' ')[1];

            // 2. Επαληθεύουμε την υπογραφή του
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Βρίσκουμε τον χρήστη στη βάση
            req.user = await User.findById(decoded.id).select('-accessToken -refreshToken');

            // 4. Προχωράμε στο επόμενο middleware
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } 
    // Fallback: Ελέγχουμε και τα cookies (για backward compatibility)
    else if (req.cookies && req.cookies.token) {
        try {
            token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-accessToken -refreshToken');
            next();
        } catch (error) {
            console.error('Cookie token verification error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } 
    else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };