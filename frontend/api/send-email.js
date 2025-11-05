// /api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { clientEmail, clientName, businessName, service, date, time, address, phone } = req.body;

        // Create transporter με Gmail (όπως το είχες στο backend)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,     // π.χ. yourname@gmail.com
                pass: process.env.GMAIL_APP_PASSWORD  // App Password (όχι το κανονικό password!)
            }
        });

        // Email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #4a90e2 0%, #1a2847 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        .booking-box { background: #f0f7ff; padding: 20px; border-left: 4px solid #4a90e2; margin: 20px 0; border-radius: 5px; }
        .booking-box h3 { margin-top: 0; color: #1a2847; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #1a2847; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">📅 Επιβεβαίωση Ραντεβού</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">MySchedulink.gr</p>
    </div>
    
    <div class="content">
        <p>Γεια σου <strong>${clientName}</strong>,</p>
        
        <p>Το ραντεβού σου επιβεβαιώθηκε επιτυχώς! 🎉</p>
        
        <div class="booking-box">
            <h3>📋 Λεπτομέρειες Ραντεβού</h3>
            
            <div class="detail">
                <span class="label">🏪 Κατάστημα:</span> ${businessName}
            </div>
            
            ${service ? `<div class="detail"><span class="label">💼 Υπηρεσία:</span> ${service}</div>` : ''}
            
            <div class="detail">
                <span class="label">📅 Ημερομηνία:</span> ${date}
            </div>
            
            <div class="detail">
                <span class="label">🕐 Ώρα:</span> ${time}
            </div>
            
            ${address ? `<div class="detail"><span class="label">📍 Διεύθυνση:</span> ${address}</div>` : ''}
            
            ${phone ? `<div class="detail"><span class="label">📞 Τηλέφωνο:</span> ${phone}</div>` : ''}
        </div>
        
        <p><strong>Σημαντικό:</strong> Παρακαλούμε να είσαι εκεί 5 λεπτά πριν την ώρα του ραντεβού σου.</p>
        
        <p>Αν χρειάζεσαι να ακυρώσεις ή να αλλάξεις το ραντεβού σου, επικοινώνησε μαζί μας${phone ? ` στο <strong>${phone}</strong>` : ''}.</p>
        
        <p style="margin-top: 30px;">Ανυπομονούμε να σε δούμε! 😊</p>
        
        <p style="margin-top: 20px;">
            Με εκτίμηση,<br>
            <strong>${businessName}</strong>
        </p>
    </div>
    
    <div class="footer">
        <p>Αυτό το email στάλθηκε από το MySchedulink.gr</p>
        <p>© 2024 MySchedulink.gr - Σύστημα Διαχείρισης Ραντεβού</p>
    </div>
</body>
</html>
        `;

        // Send email
        await transporter.sendMail({
            from: `"${businessName}" <${process.env.GMAIL_USER}>`,
            to: clientEmail,
            subject: `Επιβεβαίωση Ραντεβού - ${businessName}`,
            html: emailHtml
        });

        console.log('✅ Email sent to:', clientEmail);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('❌ Email error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}