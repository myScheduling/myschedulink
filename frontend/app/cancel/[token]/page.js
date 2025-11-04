"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CancelBookingPage() {
    const params = useParams();
    const token = params.token;
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchBooking();
    }, [token]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(\${API_URL}/api/bookings/cancel/${token}`);
            
            if (res.status === 404) {
                setError('Booking not found. The link may be invalid.');
            } else if (res.status === 410) {
                setError('This booking has already been cancelled.');
            } else if (res.ok) {
                const data = await res.json();
                setBooking(data);
            } else {
                setError('Failed to load booking details.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (e) => {
        e.preventDefault();
        setCancelling(true);
        setError('');

        try {
            const res = await fetch(`http://`${API_URL}/api/bookings/cancel/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            const data = await res.json();

            if (res.status === 400) {
                setError(data.message || 'Cancellation deadline has passed (24 hours before appointment).');
            } else if (res.ok) {
                setCancelled(true);
            } else {
                setError(data.message || 'Failed to cancel booking. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error(err);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (cancelled) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h2>
                    <p className="text-gray-600 mb-4">
                        Your booking has been successfully cancelled. A confirmation email has been sent to you.
                    </p>
                    <p className="text-sm text-gray-500">
                        If you need to book again, please visit the booking page.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-red-600 text-white px-6 py-4">
                        <h1 className="text-2xl font-bold">Cancel Booking</h1>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Client Name:</span>
                                <span className="font-medium text-gray-900">{booking.clientName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium text-gray-900">{booking.clientEmail}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Service:</span>
                                <span className="font-medium text-gray-900">{booking.serviceName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Professional:</span>
                                <span className="font-medium text-gray-900">{booking.professionalName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date & Time:</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(booking.startTime).toLocaleString('el-GR', {
                                        dateStyle: 'full',
                                        timeStyle: 'short'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Form */}
                    <form onSubmit={handleCancel} className="p-6">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Cancellation Policy:</strong> Bookings must be cancelled at least 24 hours before the appointment time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Cancellation (Optional)
                            </label>
                            <textarea
                                id="reason"
                                rows="4"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Let us know why you're cancelling..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={cancelling}
                                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition disabled:bg-gray-400 font-medium"
                            >
                                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                            >
                                Go Back
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}