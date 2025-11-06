"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

export default function BookingsManager() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        thisMonth: 0,
        cancelled: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [filter, setFilter] = useState('all'); // all, upcoming, thisMonth, cancelled

    useEffect(() => {
        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        if (!user?.uid) return;

        try {
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef, 
                where('professionalId', '==', user.uid)
                // Αφαιρέσαμε το orderBy για να μην χρειάζεται index
            );
            const snapshot = await getDocs(q);

            const bookingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort στη μνήμη αντί για Firestore
            bookingsData.sort((a, b) => {
                const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
                const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
                return dateB - dateA; // Desc order
            });

            setBookings(bookingsData);
            calculateStats(bookingsData);
        } catch (error) {
            console.error('Error loading bookings:', error);
            setMessage('❌ Σφάλμα φόρτωσης ραντεβού');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (bookingsData) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const total = bookingsData.length;
        
        const upcoming = bookingsData.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= now && b.status !== 'cancelled';
        }).length;

        const thisMonth = bookingsData.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= startOfMonth && bookingDate <= endOfMonth && b.status !== 'cancelled';
        }).length;

        const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;

        const monthlyRevenue = bookingsData
            .filter(b => {
                const bookingDate = new Date(b.date);
                return bookingDate >= startOfMonth && bookingDate <= endOfMonth && b.status !== 'cancelled';
            })
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        setStats({
            total,
            upcoming,
            thisMonth,
            cancelled,
            monthlyRevenue
        });
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

    const getFilteredBookings = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        switch (filter) {
            case 'upcoming':
                return bookings.filter(b => {
                    const bookingDate = new Date(b.date);
                    return bookingDate >= now && b.status !== 'cancelled';
                });
            case 'thisMonth':
                return bookings.filter(b => {
                    const bookingDate = new Date(b.date);
                    return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
                });
            case 'cancelled':
                return bookings.filter(b => b.status === 'cancelled');
            default:
                return bookings;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return timeString || 'N/A';
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const labels = {
            pending: 'Εκκρεμεί',
            confirmed: 'Επιβεβαιωμένο',
            cancelled: 'Ακυρωμένο'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a90e2]"></div>
                <p className="ml-3 text-gray-600">Φόρτωση ραντεβού...</p>
            </div>
        );
    }

    const filteredBookings = getFilteredBookings();

    return (
        <div className="max-w-7xl">
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {/* Total Bookings */}
                <div className="bg-white border-2 border-blue-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📊</span>
                        <span className="text-3xl font-bold text-blue-600">{stats.total}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Σύνολο Ραντεβού</p>
                </div>

                {/* Upcoming */}
                <div className="bg-white border-2 border-green-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📅</span>
                        <span className="text-3xl font-bold text-green-600">{stats.upcoming}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Επερχόμενα</p>
                </div>

                {/* This Month */}
                <div className="bg-white border-2 border-purple-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📆</span>
                        <span className="text-3xl font-bold text-purple-600">{stats.thisMonth}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Αυτόν τον Μήνα</p>
                </div>

                {/* Cancelled */}
                <div className="bg-white border-2 border-red-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">❌</span>
                        <span className="text-3xl font-bold text-red-600">{stats.cancelled}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Ακυρωμένα</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white border-2 border-yellow-500 p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">💰</span>
                        <span className="text-2xl font-bold text-yellow-600">{stats.monthlyRevenue.toFixed(2)}€</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Έσοδα Μήνα</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'all' 
                            ? 'bg-[#4a90e2] text-white shadow-md' 
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#4a90e2]'
                    }`}
                >
                    Όλα ({bookings.length})
                </button>
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'upcoming' 
                            ? 'bg-[#4a90e2] text-white shadow-md' 
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#4a90e2]'
                    }`}
                >
                    Επερχόμενα ({stats.upcoming})
                </button>
                <button
                    onClick={() => setFilter('thisMonth')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'thisMonth' 
                            ? 'bg-[#4a90e2] text-white shadow-md' 
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#4a90e2]'
                    }`}
                >
                    Τον Μήνα ({stats.thisMonth})
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === 'cancelled' 
                            ? 'bg-[#4a90e2] text-white shadow-md' 
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#4a90e2]'
                    }`}
                >
                    Ακυρωμένα ({stats.cancelled})
                </button>
            </div>

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-xl text-gray-600 font-semibold mb-2">
                        Δεν βρέθηκαν ραντεβού
                    </p>
                    <p className="text-gray-500">
                        {filter === 'all' 
                            ? 'Δεν έχετε κανένα ραντεβού ακόμα' 
                            : 'Δεν υπάρχουν ραντεβού για αυτό το φίλτρο'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#1a2847] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Ημερομηνία</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Ώρα</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Πελάτης</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Υπηρεσίες</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Τιμή</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Κατάσταση</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">Ενέργειες</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {formatDate(booking.date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {formatTime(booking.time)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {booking.clientName || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {booking.clientEmail || booking.clientPhone || ''}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {Array.isArray(booking.services) ? (
                                                    booking.services.map((service, idx) => (
                                                        <div key={idx} className="mb-1">
                                                            • {service.name || service}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>{booking.serviceName || 'N/A'}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-[#4a90e2]">
                                            {booking.totalPrice?.toFixed(2) || '0.00'}€
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {booking.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
                                                >
                                                    Ακύρωση
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}