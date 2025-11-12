// /api/check-availability.js
// Ελέγχει αν μια συγκεκριμένη ώρα είναι διαθέσιμη για κράτηση

import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { professionalId, date, time, duration = 60 } = req.query;

        if (!professionalId || !date || !time) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                required: ['professionalId', 'date', 'time']
            });
        }

        // 1. Έλεγξε αν ο επαγγελματίας έχει ωράριο για αυτή την ημέρα
        const scheduleRef = doc(db, 'schedules', professionalId);
        const scheduleSnap = await getDoc(scheduleRef);

        if (!scheduleSnap.exists()) {
            return res.status(404).json({
                available: false,
                reason: 'No schedule found for this professional'
            });
        }

        const scheduleData = scheduleSnap.data().schedule;
        
        // Μετατροπή ημέρας σε key
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dateObj = new Date(date);
        const weekday = dayNames[dateObj.getDay()];
        
        const daySchedule = scheduleData[weekday];

        if (!daySchedule || !daySchedule.enabled) {
            return res.status(200).json({
                available: false,
                reason: 'Professional is not working on this day',
                day: weekday
            });
        }

        // 2. Έλεγξε αν η ώρα είναι μέσα στο ωράριο
        const requestedTime = time; // "17:00"
        const [hours, minutes] = requestedTime.split(':');
        const requestedMinutes = parseInt(hours) * 60 + parseInt(minutes);

        const [startHours, startMinutes] = daySchedule.start.split(':');
        const [endHours, endMinutes] = daySchedule.end.split(':');
        const workStartMinutes = parseInt(startHours) * 60 + parseInt(startMinutes);
        const workEndMinutes = parseInt(endHours) * 60 + parseInt(endMinutes);

        // Έλεγξε αν η ώρα + duration χωράει στο ωράριο
        const requestedEndMinutes = requestedMinutes + parseInt(duration);

        if (requestedMinutes < workStartMinutes || requestedEndMinutes > workEndMinutes) {
            return res.status(200).json({
                available: false,
                reason: 'Time is outside working hours',
                workingHours: {
                    start: daySchedule.start,
                    end: daySchedule.end
                }
            });
        }

        // 3. Έλεγξε για υπάρχουσες κρατήσεις
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('professionalId', '==', professionalId),
            where('date', '==', date),
            where('status', '!=', 'cancelled')
        );

        const bookingsSnap = await getDocs(q);
        const bookings = bookingsSnap.docs.map(doc => doc.data());

        // Έλεγξε για overlap
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);

        for (const booking of bookings) {
            const bookingStart = booking.startTime.toDate();
            const bookingEnd = booking.endTime.toDate();

            // Έλεγχος overlap
            if (
                (startTime >= bookingStart && startTime < bookingEnd) ||
                (endTime > bookingStart && endTime <= bookingEnd) ||
                (startTime <= bookingStart && endTime >= bookingEnd)
            ) {
                return res.status(200).json({
                    available: false,
                    reason: 'Time slot is already booked',
                    conflictingBooking: {
                        time: booking.time,
                        service: booking.serviceName
                    }
                });
            }
        }

        // 4. Αν όλα OK, επέστρεψε διαθεσιμότητα
        return res.status(200).json({
            available: true,
            professionalId,
            date,
            time,
            duration: parseInt(duration),
            message: 'Time slot is available'
        });

    } catch (error) {
        console.error('❌ Error checking availability:', error);
        return res.status(500).json({ 
            error: 'Failed to check availability',
            details: error.message 
        });
    }
}
