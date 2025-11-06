"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dayBookings, setDayBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadBookings();
    }, [user]);

    useEffect(() => {
        // Όταν αλλάζει η επιλεγμένη ημέρα, φόρτωσε τα ραντεβού της
        filterBookingsByDate(selectedDate);
    }, [selectedDate, bookings]);

    const loadBookings = async () => {
        if (!user?.uid) return;

        try {
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('professionalId', '==', user.uid)
            );
            const snapshot = await getDocs(q);

            const bookingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setBookings(bookingsData);
        } catch (error) {
            console.error('Error loading bookings:', error);
            setMessage('❌ Σφάλμα φόρτωσης ραντεβού');
        } finally {
            setLoading(false);
        }
    };

    const filterBookingsByDate = (date) => {
        const dateString = date.toISOString().split('T')[0];
        const filtered = bookings.filter(b => b.date === dateString);
        setDayBookings(filtered.sort((a, b) => a.time.localeCompare(b.time)));
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτό το ραντεβού;')) return;

        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            await updateDoc(bookingRef, {
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            });

            setMessage('✅ Το ραντεβού ακυρώθηκε επιτυχώς!');
            loadBookings();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            setMessage('❌ Σφάλμα ακύρωσης. Δοκιμάστε ξανά.');
        }
    };

    // Προσθέτει badges στις ημέρες που έχουν ραντεβού
    const tileContent = ({ date, view }) => {
        if (view !== 'month') return null;

        const dateString = date.toISOString().split('T')[0];
        const dayBookingsCount = bookings.filter(b => b.date === dateString && b.status !== 'cancelled').length;

        if (dayBookingsCount === 0) return null;

        return (
            <div className="flex justify-center mt-1">
                <div className="bg-[#4a90e2] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {dayBookingsCount}
                </div>
            </div>
        );
    };

    // Προσθέτει styling στις ημέρες
    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return null;

        const dateString = date.toISOString().split('T')[0];
        const hasBookings = bookings.some(b => b.date === dateString && b.status !== 'cancelled');

        if (hasBookings) {
            return 'has-bookings';
        }
        return null;
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            confirmed: 'bg-green-100 text-green-800 border-green-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300'
        };

        const labels = {
            pending: '⏳ Εκκρεμεί',
            confirmed: '✓ Επιβεβαιωμένο',
            cancelled: '✕ Ακυρωμένο'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a90e2]"></div>
                <p className="ml-3 text-gray-600">Φόρτωση ημερολογίου...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl">
            {/* Custom CSS for calendar */}
            <style jsx global>{`
                .react-calendar {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    font-family: inherit;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .react-calendar__tile--active {
                    background: #4a90e2 !important;
                    color: white !important;
                }
                .react-calendar__tile--now {
                    background: #eff6ff;
                }
                .react-calendar__tile.has-bookings {
                    background: #dbeafe;
                }
                .react-calendar__tile:hover {
                    background: #f3f4f6;
                }
                .react-calendar__navigation button {
                    font-size: 16px;
                    font-weight: 600;
                }
            `}</style>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg animate-fadeIn ${
                    message.includes('✅') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border-2 border-blue-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-4xl">📊</span>
                        <span className="text-4xl font-bold text-blue-600">{bookings.filter(b => b.status !== 'cancelled').length}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-800">Ενεργά Ραντεβού</p>
                </div>

                <div className="bg-white border-2 border-green-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-4xl">✅</span>
                        <span className="text-4xl font-bold text-green-600">{dayBookings.filter(b => b.status !== 'cancelled').length}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-800">Ραντεβού Σήμερα</p>
                </div>

                <div className="bg-white border-2 border-purple-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-4xl">📌</span>
                        <span className="text-4xl font-bold text-purple-600">
                            {new Set(bookings.filter(b => b.status !== 'cancelled').map(b => b.date)).size}
                        </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-800">Ημέρες με Ραντεβού</p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-[#1a2847] mb-4">Ημερολόγιο Ραντεβού</h3>
                        <Calendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                            locale="el-GR"
                        />
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Συμβουλή:</strong> Οι ημέρες με μπλε badge έχουν ραντεβού. Κάντε κλικ για να δείτε λεπτομέρειες.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Day Details */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                        <h3 className="text-lg font-bold text-[#1a2847] mb-4">
                            Ραντεβού για {selectedDate.toLocaleDateString('el-GR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                            })}
                        </h3>

                        {dayBookings.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-3">📭</div>
                                <p className="text-gray-500">Δεν υπάρχουν ραντεβού για αυτή την ημέρα</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {dayBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className={`p-4 border-2 rounded-lg transition-all ${
                                            booking.status === 'cancelled' 
                                                ? 'border-red-200 bg-red-50 opacity-60' 
                                                : 'border-blue-200 bg-blue-50 hover:border-[#4a90e2] hover:shadow-md'
                                        }`}
                                    >
                                        {/* Time & Status */}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-lg font-bold text-[#1a2847]">
                                                🕐 {booking.time}
                                            </span>
                                            {getStatusBadge(booking.status)}
                                        </div>

                                        {/* Client */}
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            👤 {booking.clientName}
                                        </p>
                                        <p className="text-xs text-gray-600 mb-2">
                                            📧 {booking.clientEmail}
                                        </p>

                                        {/* Service */}
                                        <p className="text-sm text-gray-700 mb-2">
                                            💼 {booking.serviceName || booking.services?.[0]?.name || 'N/A'}
                                        </p>

                                        {/* Price */}
                                        <p className="text-sm font-semibold text-[#4a90e2] mb-3">
                                            💰 {booking.totalPrice?.toFixed(2) || '0.00'}€
                                        </p>

                                        {/* Actions */}
                                        {booking.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
                                            >
                                                Ακύρωση Ραντεβού
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}