// ΣΩΣΤΗ ΣΕΙΡΑ
const dotenv = require('dotenv');
// Φόρτωση των environment variables ΠΡΙΝ ΑΠΟ ΟΛΑ
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const unavailabilityRoutes = require('./routes/unavailabilityRoutes');
const cookieParser = require('cookie-parser');
const staffRoutes = require('./routes/staffRoutes');

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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/unavailability', unavailabilityRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});