// ΣΩΣΤΗ ΣΕΙΡΑ
const dotenv = require('dotenv');
// Φόρτωση των environment variables ΠΡΙΝ ΑΠΟ ΟΛΑ
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

// Load routes with error handling
let authRoutes, userRoutes, serviceRoutes, bookingRoutes, unavailabilityRoutes, staffRoutes;

try {
    console.log('Loading routes...');
    authRoutes = require('./routes/authRoutes');
    console.log('✅ authRoutes loaded');
    userRoutes = require('./routes/userRoutes');
    console.log('✅ userRoutes loaded');
    serviceRoutes = require('./routes/serviceRoutes');
    console.log('✅ serviceRoutes loaded');
    bookingRoutes = require('./routes/bookingRoutes');
    console.log('✅ bookingRoutes loaded');
    unavailabilityRoutes = require('./routes/unavailabilityRoutes');
    console.log('✅ unavailabilityRoutes loaded');
    staffRoutes = require('./routes/staffRoutes');
    console.log('✅ staffRoutes loaded');
    console.log('✅ All routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading routes:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
}

// Σύνδεση με τη βάση δεδομένων
connectDB();

const app = express();

// CORS - Επιτρέπει localhost και production frontend (ορισμένο μέσω CLIENT_URL)
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    clientUrl
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Επέτρεψε requests χωρίς origin (π.χ. mobile apps, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Cookies middleware
app.use(cookieParser());

// Middleware για να διαβάζει JSON bodies
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('🚀 MySchedulink API is running...');
});

console.log('Registering API routes...');
app.use('/api/auth', authRoutes);
console.log('✅ /api/auth routes registered');
app.use('/api/users', userRoutes);
console.log('✅ /api/users routes registered');
app.use('/api/services', serviceRoutes);
console.log('✅ /api/services routes registered');
app.use('/api/bookings', bookingRoutes);
console.log('✅ /api/bookings routes registered');
app.use('/api/staff', staffRoutes);
console.log('✅ /api/staff routes registered');
app.use('/api/unavailability', unavailabilityRoutes);
console.log('✅ /api/unavailability routes registered');
console.log('✅ All API routes registered successfully');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});