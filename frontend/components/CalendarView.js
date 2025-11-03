"use client";

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import API_URL from '../config/api';  // ← ΠΡΟΣΘΗΚΗ


export default function CalendarView() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://`${API_URL}/api/bookings/my-bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Transform bookings για το FullCalendar format
    const calendarEvents = bookings.map(booking => ({
        id: booking._id,
        title: `${booking.service?.name} - ${booking.clientName}`,
        start: booking.startTime,
        end: booking.endTime,
        backgroundColor: getStatusColor(booking.status),
        borderColor: getStatusColor(booking.status),
        extendedProps: {
            clientEmail: booking.clientEmail,
            status: booking.status,
            service: booking.service?.name,
            duration: booking.service?.duration,
            booking: booking
        }
    }));

    function getStatusColor(status) {
        const colors = {
            confirmed: '#10b981', // green
            cancelled: '#ef4444', // red
            completed: '#3b82f6', // blue
            'no-show': '#6b7280'  // gray
        };
        return colors[status] || '#3b82f6';
    }

    const handleEventClick = (info) => {
        setSelectedEvent(info.event);
        setShowModal(true);
    };

    const handleCancelBooking = async () => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        const token = localStorage.getItem('token');
        const bookingId = selectedEvent.id;

        try {
            const res = await fetch(`http://`${API_URL}/api/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('Booking cancelled successfully!');
                setShowModal(false);
                fetchBookings(); // Refresh
            } else {
                alert('Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Network error');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading calendar...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Booking Calendar</h2>
                <p className="text-gray-600 mt-1">View and manage your appointments</p>
            </div>

            {/* Calendar */}
            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    height="auto"
                    slotMinTime="08:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    nowIndicator={true}
                    editable={false}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    locale="el"
                />
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-6 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm text-gray-700">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-sm text-gray-700">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm text-gray-700">Cancelled</span>
                </div>
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Service</p>
                                <p className="font-medium text-gray-900">{selectedEvent.extendedProps.service}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Client</p>
                                <p className="font-medium text-gray-900">{selectedEvent.title.split(' - ')[1]}</p>
                                <p className="text-sm text-gray-500">{selectedEvent.extendedProps.clientEmail}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date & Time</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(selectedEvent.start).toLocaleString('el-GR', {
                                        dateStyle: 'full',
                                        timeStyle: 'short'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-medium text-gray-900">{selectedEvent.extendedProps.duration} minutes</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    selectedEvent.extendedProps.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    selectedEvent.extendedProps.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    selectedEvent.extendedProps.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {selectedEvent.extendedProps.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {selectedEvent.extendedProps.status === 'confirmed' && (
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleCancelBooking}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                                >
                                    Cancel Booking
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .calendar-container {
                    font-family: inherit;
                }
                .fc {
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                }
                .fc .fc-toolbar-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                }
                .fc-theme-standard td, .fc-theme-standard th {
                    border-color: #e5e7eb;
                }
                .fc-event {
                    cursor: pointer;
                    padding: 2px 4px;
                }
                .fc-event:hover {
                    opacity: 0.9;
                }
                .fc-col-header-cell {
                    background-color: #f9fafb;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}