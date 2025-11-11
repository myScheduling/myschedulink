// /api/webhook/receive-from-n8n.js
// Αυτό δέχεται κρατήσεις που γίνονται μέσω Instagram/Messenger

import { db } from '../../firebase-admin'; // Server-side Firebase
import { addDoc, collection, Timestamp } from 'firebase/firestore';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify webhook secret (για security)
    const secret = req.headers['x-n8n-secret'];
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { 
            professionalId,
            clientName, 
            clientEmail,
            clientPhone,
            service, 
            date, 
            time,
            totalPrice,
            source // 'instagram', 'messenger', 'whatsapp'
        } = req.body;

        // Parse date & time
        const [year, month, day] = date.split('-');
        const [hours, minutes] = time.split(':');
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + (service.duration || 60) * 60000);

        // Δημιουργία booking στο Firestore
        const bookingRef = await addDoc(collection(db, 'bookings'), {
            professionalId,
            serviceName: service.name,
            serviceId: service.id || null,
            clientName,
            clientEmail: clientEmail || '',
            clientPhone: clientPhone || '',
            date: date, // "2025-11-12"
            time: time, // "17:00"
            startTime: Timestamp.fromDate(startTime),
            endTime: Timestamp.fromDate(endTime),
            totalPrice: totalPrice || 0,
            status: 'confirmed',
            source: source, // Πώς έγινε η κράτηση
            services: [{
                name: service.name,
                duration: service.duration || 60,
                price: totalPrice || 0
            }],
            createdAt: Timestamp.fromDate(new Date()),
            createdVia: 'n8n_automation' // Flag ότι ήρθε από n8n
        });

        console.log('✅ Booking created from n8n:', bookingRef.id);

        return res.status(200).json({ 
            success: true, 
            bookingId: bookingRef.id,
            message: 'Booking created successfully'
        });

    } catch (error) {
        console.error('❌ Error creating booking from n8n:', error);
        return res.status(500).json({ 
            error: 'Failed to create booking', 
            details: error.message 
        });
    }
}