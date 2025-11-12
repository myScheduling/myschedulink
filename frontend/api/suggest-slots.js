// /api/suggest-slots.js
// Προτείνει εναλλακτικές ώρες κοντά στην ώρα που ζήτησε ο πελάτης

import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { professionalId, date, preferredTime, duration = 60, maxSuggestions = 3 } = req.query;

        if (!professionalId || !date) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                required: ['professionalId', 'date']
            });
        }

        // 1. Φόρτωσε το ωράριο
        const scheduleRef = doc(db, 'schedules', professionalId);
        const scheduleSnap = await getDoc(scheduleRef);

        if (!scheduleSnap.exists()) {
            return res.status(404).json({
                suggestions: [],
                reason: 'No schedule found'
            });
        }

        const scheduleData = scheduleSnap.data().schedule;
        
        // Μετατροπή ημέρας
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dateObj = new Date(date);
        const weekday = dayNames[dateObj.getDay()];
        
        const daySchedule = scheduleData[weekday];

        if (!daySchedule || !daySchedule.enabled) {
            return res.status(200).json({
                suggestions: [],
                reason: 'Professional not working on this day'
            });
        }

        // 2. Φόρτωσε όλες τις κρατήσεις για αυτή την ημέρα
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('professionalId', '==', professionalId),
            where('date', '==', date),
            where('status', '!=', 'cancelled')
        );

        const bookingsSnap = await getDocs(q);
        const bookings = bookingsSnap.docs.map(doc => ({
            time: doc.data().time,
            startTime: doc.data().startTime.toDate(),
            endTime: doc.data().endTime.toDate()
        }));

        // 3. Δημιούργησε όλα τα πιθανά slots (30-λεπτα)
        const [startHours, startMinutes] = daySchedule.start.split(':');
        const [endHours, endMinutes] = daySchedule.end.split(':');
        
        let currentMinutes = parseInt(startHours) * 60 + parseInt(startMinutes);
        const endMinutes = parseInt(endHours) * 60 + parseInt(endMinutes);
        const durationInt = parseInt(duration);

        const allSlots = [];
        while (currentMinutes + durationInt <= endMinutes) {
            const hours = Math.floor(currentMinutes / 60);
            const mins = currentMinutes % 60;
            const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            
            allSlots.push({
                time: timeStr,
                startMinutes: currentMinutes
            });
            
            currentMinutes += 30; // 30-λεπτα slots
        }

        // 4. Φιλτράρισμα: Βρες ποιες ώρες είναι διαθέσιμες
        const availableSlots = allSlots.filter(slot => {
            const slotStart = new Date(`${date}T${slot.time}:00`);
            const slotEnd = new Date(slotStart.getTime() + durationInt * 60000);

            // Έλεγξε για overlap με υπάρχουσες κρατήσεις
            for (const booking of bookings) {
                if (
                    (slotStart >= booking.startTime && slotStart < booking.endTime) ||
                    (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                    (slotStart <= booking.startTime && slotEnd >= booking.endTime)
                ) {
                    return false; // Overlap - όχι διαθέσιμο
                }
            }
            return true; // Διαθέσιμο
        });

        if (availableSlots.length === 0) {
            return res.status(200).json({
                suggestions: [],
                reason: 'No available slots for this day',
                date
            });
        }

        // 5. Αν έχουμε preferred time, βρες τα πιο κοντινά slots
        let suggestions = [];
        
        if (preferredTime) {
            const [prefHours, prefMinutes] = preferredTime.split(':');
            const preferredMinutes = parseInt(prefHours) * 60 + parseInt(prefMinutes);

            // Ταξινόμηση με βάση την απόσταση από την preferred time
            suggestions = availableSlots
                .map(slot => ({
                    ...slot,
                    distance: Math.abs(slot.startMinutes - preferredMinutes)
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, parseInt(maxSuggestions))
                .map(slot => ({
                    time: slot.time,
                    date: date
                }));
        } else {
            // Αν δεν έχουμε preferred, πάρε τις πρώτες διαθέσιμες
            suggestions = availableSlots
                .slice(0, parseInt(maxSuggestions))
                .map(slot => ({
                    time: slot.time,
                    date: date
                }));
        }

        return res.status(200).json({
            suggestions,
            totalAvailable: availableSlots.length,
            message: `Found ${suggestions.length} suggestions`
        });

    } catch (error) {
        console.error('❌ Error suggesting slots:', error);
        return res.status(500).json({ 
            error: 'Failed to suggest slots',
            details: error.message 
        });
    }
}
