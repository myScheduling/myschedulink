"use client";

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';


export default function BookingInterface({ services, professionalId, professional }) {    
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [clientDetails, setClientDetails] = useState({ name: '', email: '' });
    const [bookingStatus, setBookingStatus] = useState(''); // '', 'booking', 'confirmed', 'error'
    const [schedule, setSchedule] = useState(null);

    // Φόρτωση ωραρίου από Firestore
    useEffect(() => {
        async function loadSchedule() {
            if (!professionalId) return;
            try {
                const scheduleRef = doc(db, 'schedules', professionalId);
                const scheduleSnap = await getDoc(scheduleRef);
                if (scheduleSnap.exists()) {
                    setSchedule(scheduleSnap.data().schedule);
                    console.log('✅ Schedule loaded:', scheduleSnap.data().schedule);
                } else {
                    console.warn('⚠️ No schedule found for professional');
                }
            } catch (error) {
                console.error('Error loading schedule:', error);
            }
        }
        loadSchedule();
    }, [professionalId]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setSelectedDate(null);
        setAvailableTimes([]);
        setSelectedTime(null);
    };

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setAvailableTimes([]);
        setSelectedTime(null);
        if (!selectedService || !schedule) {
            console.warn('⚠️ No service or schedule available');
            return;
        }
        setLoadingTimes(true);
        try {
            const slots = await computeAvailableSlots(date, selectedService, professionalId, schedule);
            setAvailableTimes(slots);
        } catch (error) {
            console.error('Error computing availability:', error);
        } finally {
            setLoadingTimes(false);
        }
    };
    
    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleDetailChange = (e) => {
        setClientDetails({ ...clientDetails, [e.target.name]: e.target.value });
    };

    const handleFinalBooking = async (e) => {
        e.preventDefault();
        setBookingStatus('booking');
        
        const dateString = selectedDate.toISOString().split('T')[0];
        const [hours, minutes] = selectedTime.split(':');
        const startTime = new Date(`${dateString}T${hours}:${minutes}:00`);
        const endTime = new Date(startTime.getTime() + (selectedService.duration || 60) * 60000);
        
        console.log('🕐 Booking startTime:', startTime.toISOString());

        try {
            // 1. Create booking in Firestore
            await addDoc(collection(db, 'bookings'), {
                professionalId,
                serviceId: selectedService._id || selectedService.id,
                serviceName: selectedService.name,
                clientName: clientDetails.name,
                clientEmail: clientDetails.email,
                date: dateString,
                time: selectedTime,
                startTime: Timestamp.fromDate(startTime),
                endTime: Timestamp.fromDate(endTime),
                totalPrice: selectedService.price || 0,
                status: 'confirmed',
                services: [{ name: selectedService.name, duration: selectedService.duration, price: selectedService.price || 0 }],
                createdAt: Timestamp.fromDate(new Date())
            });

            // 2. Send confirmation email
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientEmail: clientDetails.email,
                        clientName: clientDetails.name,
                        businessName: professional?.businessName || professional?.displayName || 'Κατάστημα',
                        service: selectedService.name,
                        date: selectedDate.toLocaleDateString('el-GR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                        }),
                        time: selectedTime,
                        address: professional?.address || '',
                        phone: professional?.phone || ''
                    })
                });
                console.log('✅ Email sent successfully!');
            } catch (emailError) {
                console.error('⚠️ Email failed (booking still created):', emailError);
            }

            setBookingStatus('confirmed');
            setAvailableTimes([]);
        } catch (error) {
            setBookingStatus('error');
            console.error('Booking error:', error);
        }
    };

    async function computeAvailableSlots(date, service, professionalId, scheduleData) {
        if (!service || !scheduleData) {
            console.warn('⚠️ Missing service or schedule data');
            return [];
        }

        // Μετατροπή ημέρας σε key (monday, tuesday, etc.)
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const weekday = dayNames[date.getDay()];
        
        console.log('📅 Checking availability for:', weekday);
        
        // Παίρνουμε τα slots για αυτή την ημέρα
        const daySchedule = scheduleData[weekday];
        
        if (!daySchedule || !daySchedule.isOpen) {
            console.log('❌ Day is closed:', weekday);
            return [];
        }

        const daySlots = daySchedule.slots.filter(slot => slot.start && slot.end);
        
        if (daySlots.length === 0) {
            console.log('❌ No time slots configured for:', weekday);
            return [];
        }

        console.log('✅ Found slots for', weekday, ':', daySlots);

        const durationMin = service.duration || 60;
        const startOfDay = new Date(date); 
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); 
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch existing bookings για αυτή την ημέρα
        let existingBookings = [];
        try {
            const bookingsQ = query(
                collection(db, 'bookings'),
                where('professionalId', '==', professionalId),
                where('date', '==', date.toISOString().split('T')[0])
            );
            const bookingsSnap = await getDocs(bookingsQ);
            existingBookings = bookingsSnap.docs
                .map(d => d.data())
                .filter(b => b.status !== 'cancelled')
                .map(b => ({
                    start: b.startTime?.toDate?.() || new Date(b.startTime),
                    end: b.endTime?.toDate?.() || new Date((b.startTime?.toDate?.() || new Date(b.startTime)).getTime() + durationMin * 60000)
                }));
            
            console.log('📋 Existing bookings:', existingBookings.length);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }

        function overlaps(aStart, aEnd, bStart, bEnd) {
            return aStart < bEnd && bStart < aEnd;
        }

        const candidates = [];
        
        for (const slot of daySlots) {
            const [sh, sm] = slot.start.split(':').map(Number);
            const [eh, em] = slot.end.split(':').map(Number);
            
            const windowStart = new Date(date); 
            windowStart.setHours(sh, sm || 0, 0, 0);
            const windowEnd = new Date(date); 
            windowEnd.setHours(eh, em || 0, 0, 0);

            console.log(`⏰ Processing slot: ${slot.start} - ${slot.end}`);

            // Δημιουργία υποψήφιων ωρών ανά 15 λεπτά
            for (let t = new Date(windowStart); t.getTime() + durationMin * 60000 <= windowEnd.getTime(); t = new Date(t.getTime() + 15 * 60000)) {
                const tEnd = new Date(t.getTime() + durationMin * 60000);
                const blockedByBooking = existingBookings.some(b => overlaps(t, tEnd, b.start, b.end));
                
                if (!blockedByBooking) {
                    candidates.push(`${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`);
                }
            }
        }

        console.log('✅ Available slots:', candidates.length);
        
        // Deduplicate και sort
        return Array.from(new Set(candidates)).sort();
    }
    
    if (bookingStatus === 'confirmed') {
        return (
            <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600">Επιβεβαίωση Ραντεβού!</h3>
                <p className="mt-2 text-gray-700">Το ραντεβού σας καταχωρήθηκε επιτυχώς.</p>
                <p className="mt-1 text-gray-600">Θα σας δούμε στις {selectedDate.toLocaleDateString('el-GR')} στις {selectedTime}!</p>
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-700">
                        📧 <strong>Έλεγξε το email σου</strong> για περισσότερες πληροφορίες.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 border rounded-lg shadow-lg bg-white">
            {!selectedService ? ( /* STEP 1: SELECT SERVICE */
                <>
                    <h3 className="text-2xl font-semibold mb-6 text-gray-700">Βήμα 1: Επιλέξτε Υπηρεσία</h3>
                    <ul className="space-y-4">
                        {services.map((service) => (
                            <li 
                                key={service._id || service.id} 
                                onClick={() => handleServiceSelect(service)} 
                                className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#4a90e2] hover:bg-blue-50 transition cursor-pointer"
                            >
                                <div>
                                    <p className="font-medium text-lg text-gray-900">{service.name}</p>
                                    <p className="text-gray-500">⏱️ {service.duration} λεπτά</p>
                                </div>
                                {service.price && <p className="font-bold text-lg text-[#4a90e2]">€{service.price}</p>}
                            </li>
                        ))}
                    </ul>
                </>
            ) : !selectedTime ? ( /* STEP 2: SELECT DATE & TIME */
                <>
                    <button 
                        onClick={() => setSelectedService(null)} 
                        className="text-[#4a90e2] hover:text-[#1a2847] mb-4 font-medium"
                    >
                        ← Πίσω στις υπηρεσίες
                    </button>
                    <h3 className="text-2xl font-semibold mb-2 text-gray-700">Βήμα 2: Επιλέξτε Ημερομηνία & Ώρα</h3>
                    <p className="mb-4">Επιλέξατε: <span className="font-bold text-[#4a90e2]">{selectedService.name}</span></p>
                    
                    {!schedule && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                            <p className="text-yellow-800">⚠️ Το ωράριο του επαγγελματία δεν έχει ρυθμιστεί ακόμα.</p>
                        </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="mx-auto">
                            <Calendar 
                                onChange={handleDateChange} 
                                value={selectedDate} 
                                minDate={new Date()} 
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-4 text-gray-700">
                                Διαθέσιμες Ώρες για {selectedDate ? selectedDate.toLocaleDateString('el-GR') : '...'}
                            </h4>
                            {loadingTimes && (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a90e2]"></div>
                                    <p className="ml-3">Φόρτωση ωρών...</p>
                                </div>
                            )}
                            {!loadingTimes && selectedDate && availableTimes.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {availableTimes.map(time => (
                                        <button 
                                            key={time} 
                                            onClick={() => handleTimeSelect(time)} 
                                            className="p-3 border-2 border-gray-300 rounded-lg text-center hover:bg-[#4a90e2] hover:text-white hover:border-[#4a90e2] transition font-medium"
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!loadingTimes && selectedDate && availableTimes.length === 0 && (
                                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                    <p className="text-gray-600">❌ Δεν υπάρχουν διαθέσιμες ώρες για αυτή την ημέρα.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : ( /* STEP 3: CONFIRM DETAILS */
                <>
                    <button 
                        onClick={() => setSelectedTime(null)} 
                        className="text-[#4a90e2] hover:text-[#1a2847] mb-4 font-medium"
                    >
                        ← Πίσω στην επιλογή ώρας
                    </button>
                    <h3 className="text-2xl font-semibold mb-4 text-gray-700">Βήμα 3: Επιβεβαίωση Στοιχείων</h3>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                        <p className="text-gray-700">
                            Κλείνετε ραντεβού για <span className="font-bold text-[#4a90e2]">{selectedService.name}</span> στις{' '}
                            <span className="font-bold">{selectedDate.toLocaleDateString('el-GR')}</span> στις{' '}
                            <span className="font-bold">{selectedTime}</span>.
                        </p>
                    </div>
                    <form onSubmit={handleFinalBooking} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Όνομα *</label>
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Το όνομά σας" 
                                required 
                                onChange={handleDetailChange} 
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="email@example.com" 
                                required 
                                onChange={handleDetailChange} 
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={bookingStatus === 'booking'} 
                            className="w-full bg-[#4a90e2] text-white p-4 rounded-lg hover:bg-[#1a2847] transition disabled:bg-gray-400 font-semibold text-lg"
                        >
                            {bookingStatus === 'booking' ? 'Κράτηση...' : '✓ Επιβεβαίωση Ραντεβού'}
                        </button>
                        {bookingStatus === 'error' && (
                            <p className="text-red-600 text-center font-medium">❌ Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.</p>
                        )}
                    </form>
                </>
            )}
        </div>
    );
}