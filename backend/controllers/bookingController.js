const { google } = require('googleapis');
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Unavailability = require('../models/Unavailability');

// 🆕 DASHBOARD: Get all bookings για τον επαγγελματία
const getMyBookings = async (req, res) => {
    try {
        const { status, serviceId, search, startDate, endDate } = req.query;
        const professionalId = req.user._id;

        // Build query
        let query = { professional: professionalId };

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by service
        if (serviceId) {
            query.service = serviceId;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        // Search by client name or email
        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { clientEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('service', 'name duration price')
            .sort({ startTime: -1 })
            .limit(100);

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 🆕 DASHBOARD: Get booking statistics
const getBookingStats = async (req, res) => {
    try {
        const professionalId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [totalBookings, upcomingBookings, monthlyBookings, cancelledBookings] = await Promise.all([
            Booking.countDocuments({ professional: professionalId, status: 'confirmed' }),
            Booking.countDocuments({ 
                professional: professionalId, 
                status: 'confirmed',
                startTime: { $gte: now }
            }),
            Booking.countDocuments({ 
                professional: professionalId,
                startTime: { $gte: startOfMonth, $lte: endOfMonth }
            }),
            Booking.countDocuments({ 
                professional: professionalId, 
                status: 'cancelled'
            })
        ]);

        // Revenue calculation (if services have prices)
        const revenueData = await Booking.aggregate([
            { 
                $match: { 
                    professional: new mongoose.Types.ObjectId(professionalId),
                    status: 'confirmed',
                    startTime: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'service',
                    foreignField: '_id',
                    as: 'serviceData'
                }
            },
            { $unwind: '$serviceData' },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$serviceData.price' }
                }
            }
        ]);

        const monthlyRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        res.json({
            totalBookings,
            upcomingBookings,
            monthlyBookings,
            cancelledBookings,
            monthlyRevenue
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 🆕 DASHBOARD: Manual cancellation by professional
const cancelBookingByProfessional = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const professionalId = req.user._id;

        const booking = await Booking.findOne({ 
            _id: bookingId, 
            professional: professionalId 
        }).populate('professional', 'accessToken refreshToken');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        // Delete from Google Calendar
        if (booking.googleEventId) {
            try {
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID, 
                    process.env.GOOGLE_CLIENT_SECRET
                );
                oauth2Client.setCredentials({ 
                    access_token: booking.professional.accessToken, 
                    refresh_token: booking.professional.refreshToken 
                });
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: booking.googleEventId,
                    sendNotifications: true
                });
            } catch (googleError) {
                console.error('Error deleting from Google Calendar:', googleError);
            }
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancellationReason = 'Cancelled by professional';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// EXISTING FUNCTIONS με updates
const getAvailability = async (req, res) => {
    try {
        console.log('\n--- NEW AVAILABILITY CHECK ---');
        const { userId, serviceId, date } = req.query;
        if (!userId || !serviceId || !date) return res.status(400).json({ message: 'Please provide all required fields' });

        console.log(`1. Received request for userId: ${userId}, date: ${date}`);

        const professional = await User.findById(userId);
        const service = await Service.findById(serviceId);
        if (!professional || !service) return res.status(404).json({ message: 'Professional or Service not found' });

        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials({ access_token: professional.accessToken, refresh_token: professional.refreshToken });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const timeMin = new Date(`${date}T00:00:00.000Z`);
        const timeMax = new Date(`${date}T23:59:59.999Z`);
        console.log('2. Searching in UTC time range:', { timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString() });

        const professionalObjectId = new mongoose.Types.ObjectId(userId);

        // 🔍 Παίρνουμε ΟΛΑ τα unavailabilities για debugging
        const allUnavailabilities = await Unavailability.find({
            professional: professionalObjectId,
            isActive: true
        });
        console.log('🔍 ALL unavailabilities in DB:', allUnavailabilities);

        // 🆕 ΔΙΟΡΘΩΜΕΝΟΣ ΕΛΕΓΧΟΣ: Ελέγχουμε full-day blocks με σωστή σύγκριση ημερομηνιών
        const requestedDate = new Date(date);
        const hasFullDayBlock = allUnavailabilities.some(u => {
            if (u.type === 'full-day') {
                const blockDate = new Date(u.date);
                // Συγκρίνουμε μόνο την ημερομηνία (χωρίς ώρα)
                const isSameDay = 
                    blockDate.getUTCFullYear() === requestedDate.getUTCFullYear() &&
                    blockDate.getUTCMonth() === requestedDate.getUTCMonth() &&
                    blockDate.getUTCDate() === requestedDate.getUTCDate();
                
                console.log(`🔍 Checking full-day block: ${blockDate.toISOString()} vs ${requestedDate.toISOString()} = ${isSameDay}`);
                return isSameDay;
            }
            return false;
        });

        console.log('🚫 Has full-day block for this date:', hasFullDayBlock);

        if (hasFullDayBlock) {
            console.log('❌ Returning empty slots (day is fully blocked)');
            return res.status(200).json([]); // No slots available
        }

        const [googleEvents, localBookingsForDate] = await Promise.all([
            calendar.events.list({ calendarId: 'primary', timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), singleEvents: true, orderBy: 'startTime', timeZone: 'UTC' }),
            Booking.find({ 
                professional: professionalObjectId, 
                startTime: { $lt: timeMax }, 
                endTime: { $gt: timeMin },
                status: 'confirmed'
            })
        ]);

        console.log('4. Bookings found for THIS SPECIFIC DATE in our DB:', localBookingsForDate);

        const googleBusySlots = googleEvents.data.items.filter(e => e.start.dateTime).map(e => ({ start: new Date(e.start.dateTime), end: new Date(e.end.dateTime) }));
        const localBusySlots = localBookingsForDate.map(b => ({ start: new Date(b.startTime), end: new Date(b.endTime) }));
        
        // 🆕 Time-slot unavailabilities
        const timeSlotUnavailabilities = allUnavailabilities.filter(u => {
            if (u.type === 'time-slot') {
                const uStart = new Date(u.startTime);
                const uEnd = new Date(u.endTime);
                // Ελέγχουμε αν το time-slot είναι για την ίδια μέρα
                return uStart < timeMax && uEnd > timeMin;
            }
            return false;
        });
        
        const unavailabilitySlots = timeSlotUnavailabilities.map(u => ({ 
            start: new Date(u.startTime), 
            end: new Date(u.endTime) 
        }));
        
        // 🆕 Recurring unavailabilities
        const dayOfWeek = new Date(date).toLocaleString('en-US', { timeZone: 'UTC', weekday: 'long' }).toLowerCase();
        const recurringUnavailabilities = allUnavailabilities.filter(u => 
            u.type === 'recurring' && u.recurringDay === dayOfWeek
        );
        
        const recurringSlots = recurringUnavailabilities.map(u => {
            const [startHours, startMinutes] = u.recurringStartTime.split(':');
            const [endHours, endMinutes] = u.recurringEndTime.split(':');
            return {
                start: new Date(`${date}T${startHours}:${startMinutes}:00Z`),
                end: new Date(`${date}T${endHours}:${endMinutes}:00Z`)
            };
        });

        const busySlots = [...googleBusySlots, ...localBusySlots, ...unavailabilitySlots, ...recurringSlots];
        console.log('5. Total busy slots to filter against:', busySlots);

        const workingHoursForDay = professional.workingHours[dayOfWeek];
        const availableSlots = [];
        const serviceDuration = service.duration;

        for (const workBlock of workingHoursForDay) {
            let slotStart = new Date(`${date}T${workBlock.start}:00Z`);
            const workBlockEnd = new Date(`${date}T${workBlock.end}:00Z`);
            while (true) {
                const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
                if (slotEnd > workBlockEnd) break;
                const isOverlapping = busySlots.some(busySlot => (slotStart.getTime() < busySlot.end.getTime() && slotEnd.getTime() > busySlot.start.getTime()));
                if (!isOverlapping) {
                    const hours = String(slotStart.getUTCHours()).padStart(2, '0');
                    const minutes = String(slotStart.getUTCMinutes()).padStart(2, '0');
                    availableSlots.push(`${hours}:${minutes}`);
                }
                slotStart = slotEnd;
            }
        }
        
        console.log('6. Available slots:', availableSlots);
        res.status(200).json(availableSlots);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createBooking = async (req, res) => {
    try {
        const { professionalId, serviceId, staffId, startTime, clientName, clientEmail } = req.body;
        if (!professionalId || !serviceId || !startTime || !clientName || !clientEmail) return res.status(400).json({ message: 'Please provide all required fields' });

        const professional = await User.findById(professionalId);
        const service = await Service.findById(serviceId);
        if (!professional || !service) return res.status(404).json({ message: 'Professional or Service not found' });

        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials({ access_token: professional.accessToken, refresh_token: professional.refreshToken });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const eventStart = new Date(startTime);
        const eventEnd = new Date(eventStart.getTime() + service.duration * 60000);

        const timeZone = 'Europe/Athens';
        const professionalObjectId = new mongoose.Types.ObjectId(professionalId);

        const [googleConflict, localConflict] = await Promise.all([
             calendar.events.list({ calendarId: 'primary', timeMin: eventStart.toISOString(), timeMax: eventEnd.toISOString(), maxResults: 1, timeZone }),
             Booking.find({ 
                professional: professionalObjectId, 
                startTime: { $lt: eventEnd }, 
                endTime: { $gt: eventStart },
                status: 'confirmed'
            })
        ]);

        if (googleConflict.data.items.length > 0 || localConflict.length > 0) {
            return res.status(409).json({ message: 'This time slot has just been booked. Please choose another one.' });
        }

        const tempBooking = new Booking({ 
            professional: professionalId, 
            service: serviceId, 
            staff: staffId || null, 
            clientName, 
            clientEmail, 
            startTime: eventStart, 
            endTime: eventEnd 
        });
        await tempBooking.save();

        const cancellationUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000'}/cancel/${tempBooking.cancellationToken}`;

        const event = {
            summary: `Booking: ${service.name} - ${clientName}`,
            description: `Client Details:\nName: ${clientName}\nEmail: ${clientEmail}\n\n🔗 To cancel this booking, visit:\n${cancellationUrl}`,
            start: { dateTime: eventStart.toISOString(), timeZone },
            end: { dateTime: eventEnd.toISOString(), timeZone },
            attendees: [{ email: clientEmail }, { email: professional.email }],
        };

        const googleEvent = await calendar.events.insert({ 
            calendarId: 'primary', 
            resource: event, 
            sendNotifications: true 
        });

        tempBooking.googleEventId = googleEvent.data.id;
        await tempBooking.save();

        res.status(201).json({ 
            message: 'Booking created successfully!',
            cancellationUrl 
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getBookingByToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        const booking = await Booking.findOne({ cancellationToken: token })
            .populate('service', 'name duration')
            .populate('professional', 'displayName email businessName');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(410).json({ message: 'This booking has already been cancelled' });
        }

        res.json({
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            serviceName: booking.service.name,
            professionalName: booking.professional.displayName || booking.professional.businessName,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { token } = req.params;
        const { reason } = req.body;

        const booking = await Booking.findOne({ cancellationToken: token })
            .populate('professional', 'accessToken refreshToken email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(410).json({ message: 'This booking has already been cancelled' });
        }

        const hoursDiff = (new Date(booking.startTime) - new Date()) / 36e5;
        if (hoursDiff < 24) {
            return res.status(400).json({ 
                message: 'Cancellations must be made at least 24 hours before the appointment time.' 
            });
        }

        if (booking.googleEventId) {
            try {
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID, 
                    process.env.GOOGLE_CLIENT_SECRET
                );
                oauth2Client.setCredentials({ 
                    access_token: booking.professional.accessToken, 
                    refresh_token: booking.professional.refreshToken 
                });
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: booking.googleEventId,
                    sendNotifications: true
                });

                console.log(`✅ Google Calendar event ${booking.googleEventId} deleted`);
            } catch (googleError) {
                console.error('Error deleting Google Calendar event:', googleError);
            }
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancellationReason = reason || 'No reason provided';
        await booking.save();

        res.json({ 
            message: 'Booking cancelled successfully. A confirmation email has been sent.' 
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAvailability,
    createBooking,
    getBookingByToken,
    cancelBooking,
    getMyBookings,
    getBookingStats,
    cancelBookingByProfessional
};