"use client";

import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function BookingsManager() {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [filters]);

    const fetchBookings = async () => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        try {
            let q = query(
                collection(db, "bookings"),
                where("professionalId", "==", auth.currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            let bookingsList = [];
            querySnapshot.forEach((doc) => {
                const bookingData = { id: doc.id, ...doc.data() };
                
                // Apply filters
                if (filters.status !== 'all' && bookingData.status !== filters.status) {
                    return;
                }
                
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    if (!bookingData.clientName?.toLowerCase().includes(searchLower) &&
                        !bookingData.clientEmail?.toLowerCase().includes(searchLower)) {
                        return;
                    }
                }
                
                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    const bookingDate = bookingData.startTime?.toDate?.() || new Date(bookingData.startTime);
                    if (bookingDate < startDate) {
                        return;
                    }
                }
                
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    const bookingDate = bookingData.startTime?.toDate?.() || new Date(bookingData.startTime);
                    if (bookingDate > endDate) {
                        return;
                    }
                }
                
                bookingsList.push(bookingData);
            });
            
            // Sort by startTime
            bookingsList.sort((a, b) => {
                const dateA = a.startTime?.toDate?.() || new Date(a.startTime);
                const dateB = b.startTime?.toDate?.() || new Date(b.startTime);
                return dateB - dateA;
            });
            
            setBookings(bookingsList);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!auth.currentUser) {
            return;
        }

        try {
            const q = query(
                collection(db, "bookings"),
                where("professionalId", "==", auth.currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            
            let totalBookings = 0;
            let upcomingBookings = 0;
            let monthlyBookings = 0;
            let cancelledBookings = 0;
            let monthlyRevenue = 0;
            
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            querySnapshot.forEach((doc) => {
                const booking = doc.data();
                totalBookings++;
                
                const bookingDate = booking.startTime?.toDate?.() || new Date(booking.startTime);
                
                if (bookingDate >= now) {
                    upcomingBookings++;
                }
                
                if (bookingDate >= startOfMonth) {
                    monthlyBookings++;
                    if (booking.status === 'confirmed' && booking.service?.price) {
                        monthlyRevenue += booking.service.price;
                    }
                }
                
                if (booking.status === 'cancelled') {
                    cancelledBookings++;
                }
            });
            
            setStats({
                totalBookings,
                upcomingBookings,
                monthlyBookings,
                cancelledBookings,
                monthlyRevenue
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const bookingRef = doc(db, "bookings", bookingId);
            await updateDoc(bookingRef, {
                status: 'cancelled',
                cancelledAt: new Date()
            });

            alert('Booking cancelled successfully!');
            fetchBookings();
            fetchStats();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Network error. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            'no-show': 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Upcoming</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.upcomingBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="text-3xl font-bold text-green-600">{stats.monthlyBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Cancelled</p>
                        <p className="text-3xl font-bold text-red-600">{stats.cancelledBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-purple-600">€{stats.monthlyRevenue}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Filter Bookings</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="all">All</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Client name or email..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Bookings List ({bookings.length})</h3>
                </div>
                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No bookings found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bookings.map((booking) => {
                                    const bookingDate = booking.startTime?.toDate?.() || new Date(booking.startTime);
                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {bookingDate.toLocaleDateString('el-GR', {
                                                        dateStyle: 'medium'
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {bookingDate.toLocaleTimeString('el-GR', {
                                                        timeStyle: 'short'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{booking.clientName}</div>
                                                <div className="text-sm text-gray-500">{booking.clientEmail}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{booking.service?.name || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">{booking.service?.duration || 0} min</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
