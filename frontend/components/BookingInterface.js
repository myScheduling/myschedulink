"use client";

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function BookingInterface({ services, professionalId }) {    
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [clientDetails, setClientDetails] = useState({ name: '', email: '' });
    const [bookingStatus, setBookingStatus] = useState(''); // '', 'booking', 'confirmed', 'error'



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
        if (!selectedService) return;
        setLoadingTimes(true);
        const dateString = date.toISOString().split('T')[0];
        const url = `http://localhost:5000/api/bookings/availability?userId=${professionalId}&serviceId=${selectedService._id}&date=${dateString}&timestamp=${Date.now()}`;
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) setAvailableTimes(await res.json());
        } catch (error) { console.error("Error fetching availability:", error); }
        finally { setLoadingTimes(false); }
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
        const startTime = new Date(`${dateString}T${hours}:${minutes}:00.000Z`);
        
        console.log('🕒 Booking startTime (UTC):', startTime.toISOString());

        try {
            const res = await fetch(`http://localhost:5000/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professionalId,
                    serviceId: selectedService._id,
                    startTime: startTime.toISOString(),
                    clientName: clientDetails.name,
                    clientEmail: clientDetails.email,
                }),
            });
            if (res.ok) {
                setBookingStatus('confirmed');
                setAvailableTimes([]);
            } else { 
                const errorData = await res.json();
                console.error('Booking error:', errorData);
                throw new Error(errorData.message || 'Booking failed'); 
            }
        } catch (error) {
            setBookingStatus('error');
            console.error(error);
        }
    };
    
    if (bookingStatus === 'confirmed') {
        return (
            <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600">Booking Confirmed!</h3>
                <p className="mt-2 text-gray-700">A confirmation email has been sent to you with all the details.</p>
                <p className="mt-1 text-gray-600">See you on {selectedDate.toLocaleDateString()} at {selectedTime}!</p>
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-700">
                        📧 <strong>Check your email</strong> for a cancellation link if you need to cancel or reschedule.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 border rounded-lg shadow-lg bg-white">
            {!selectedService ? ( /* STEP 1: SELECT SERVICE */
                <>
                    <h3 className="text-2xl font-semibold mb-6 text-gray-700">Step 1: Select a Service</h3>
                    <ul className="space-y-4">
                        {services.map((service) => (
                            <li key={service._id} onClick={() => handleServiceSelect(service)} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-100 transition cursor-pointer">
                                <div>
                                    <p className="font-medium text-lg text-gray-900">{service.name}</p>
                                    <p className="text-gray-500">{service.duration} minutes</p>
                                </div>
                                {service.price && <p className="font-bold text-lg text-gray-800">€{service.price}</p>}
                            </li>
                        ))}
                    </ul>
                </>
            ) : !selectedTime ? ( /* STEP 2: SELECT DATE & TIME */
                <>
                    <button onClick={() => setSelectedService(null)} className="text-blue-600 mb-4">&larr; Back to services</button>
                    <h3 className="text-2xl font-semibold mb-2 text-gray-700">Step 2: Select Date & Time</h3>
                    <p className="mb-4">You selected: <span className="font-bold">{selectedService.name}</span></p>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="mx-auto"><Calendar onChange={handleDateChange} value={selectedDate} minDate={new Date()} /></div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-2">Available Times for {selectedDate ? selectedDate.toLocaleDateString() : '...'}</h4>
                            {loadingTimes && <p>Loading times...</p>}
                            {!loadingTimes && selectedDate && availableTimes.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">{availableTimes.map(time => (
                                    <button key={time} onClick={() => handleTimeSelect(time)} className="p-2 border rounded-md text-center hover:bg-blue-600 hover:text-white transition">{time}</button>
                                ))}</div>
                            )}
                            {!loadingTimes && selectedDate && availableTimes.length === 0 && (<p>No available slots for this day.</p>)}
                        </div>
                    </div>
                </>
            ) : ( /* STEP 3: CONFIRM DETAILS */
                <>
                    <button onClick={() => setSelectedTime(null)} className="text-blue-600 mb-4">&larr; Back to time selection</button>
                    <h3 className="text-2xl font-semibold mb-4">Step 3: Confirm Your Details</h3>
                    <p>You are booking <span className="font-bold">{selectedService.name}</span> on <span className="font-bold">{selectedDate.toLocaleDateString()}</span> at <span className="font-bold">{selectedTime}</span>.</p>
                    <form onSubmit={handleFinalBooking} className="mt-6">
                        <input type="text" name="name" placeholder="Your Name" required onChange={handleDetailChange} className="w-full p-2 border rounded-md mb-4" />
                        <input type="email" name="email" placeholder="Your Email" required onChange={handleDetailChange} className="w-full p-2 border rounded-md mb-4" />
                        <button type="submit" disabled={bookingStatus === 'booking'} className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition disabled:bg-gray-400">
                            {bookingStatus === 'booking' ? 'Booking...' : 'Confirm Booking'}
                        </button>
                        {bookingStatus === 'error' && <p className="text-red-500 mt-2">Something went wrong. Please try again.</p>}
                    </form>
                </>
            )}
        </div>
    );
}