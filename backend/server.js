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

// Ενεργοποίηση του CORS για να μιλάει το frontend με το backend
app.use(cors({
    origin: 'http://localhost:3000', // Επέτρεψε αιτήματα ΜΟΝΟ από το frontend σου
    credentials: true // Επέτρεψε την αποστολή cookies
}));

// η μαλακια για τα cookies 
app.use(cookieParser());

// Middleware για να διαβάζει JSON bodies
app.use(express.json());

app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

app.use('/api/staff', staffRoutes);

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Χρήση των routes για την αυθεντικοποίηση
app.use('/api/auth', authRoutes);

//Για τα unvailable ραντεβού .
app.use('/api/unavailability', unavailabilityRoutes);

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});