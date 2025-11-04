// backend/controllers/authController.js
const { google } = require('googleapis');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Δημιουργούμε τον client της Google για το OAuth2
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL}/api/auth/google/callback`
);
// Τα δικαιώματα που ζητάμε από τον χρήστη
const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar'
];

exports.loginWithGoogle = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(url);
};

exports.googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        // Ανταλλαγή code με tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Παίρνουμε τις πληροφορίες του χρήστη
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        // Ελέγχουμε αν ο χρήστης υπάρχει
        let user = await User.findOne({ googleId: data.id });

        if (user) {
            user.accessToken = tokens.access_token;
            if (tokens.refresh_token) {
                user.refreshToken = tokens.refresh_token;
            }
        } else {
            user = new User({
                googleId: data.id,
                email: data.email,
                displayName: data.name,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
            });
        }

        await user.save();

        // Δημιουργούμε το JWT Token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // 🔥 ΔΙΟΡΘΩΣΗ: Στέλνουμε το token στο URL αντί για cookie
        // Έτσι το frontend μπορεί να το πάρει και να το βάλει στο localStorage
        res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);

    } catch (error) {
        console.error('Error during Google OAuth callback', error);
        res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
    }
};