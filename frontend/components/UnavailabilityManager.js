"use client";

import { useState, useEffect } from 'react';
import API_URL from '../config/api';

export default function UnavailabilityManager() {
    const [unavailabilities, setUnavailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'full-day',
        date: '',
        startTime: '',
        endTime: '',
        recurringDay: 'monday',
        recurringStartTime: '',
        recurringEndTime: '',
        reason: ''
    });

    useEffect(() => {
        fetchUnavailabilities();
    }, []);

    const fetchUnavailabilities = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/unavailability`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnavailabilities(data);
            }
        } catch (error) {
            console.error('Error fetching unavailabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/api/unavailability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Unavailability block added successfully!');
                setShowForm(false);
                setFormData({
                    type: 'full-day',
                    date: '',
                    startTime: '',
                    endTime: '',
                    recurringDay: 'monday',
                    recurringStartTime: '',
                    recurringEndTime: '',
                    reason: ''
                });
                fetchUnavailabilities();
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to add unavailability');
            }
        } catch (error) {
            console.error('Error creating unavailability:', error);
            alert('Network error. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this unavailability block?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://`${API_URL}/api/unavailability/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('Unavailability removed successfully!');
                fetchUnavailabilities();
            }
        } catch (error) {
            console.error('Error deleting unavailability:', error);
            alert('Network error. Please try again.');
        }
    };

    const formatUnavailability = (unavail) => {
        if (unavail.type === 'full-day') {
            return `Full Day: ${new Date(unavail.date).toLocaleDateString('el-GR')}`;
        } else if (unavail.type === 'time-slot') {
            return `${new Date(unavail.startTime).toLocaleDateString('el-GR')} | ${new Date(unavail.startTime).toLocaleTimeString('el-GR', { timeStyle: 'short' })} - ${new Date(unavail.endTime).toLocaleTimeString('el-GR', { timeStyle: 'short' })}`;
        } else {
            return `Every ${unavail.recurringDay} | ${unavail.recurringStartTime} - ${unavail.recurringEndTime}`;
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            'full-day': 'bg-red-100 text-red-800',
            'time-slot': 'bg-yellow-100 text-yellow-800',
            'recurring': 'bg-purple-100 text-purple-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
                {type.replace('-', ' ').toUpperCase()}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading unavailabilities...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Unavailability Management</h2>
                        <p className="text-gray-600 mt-1">Block specific dates or times when you're not available</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        {showForm ? '✕ Cancel' : '+ Add Block'}
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Add Unavailability Block</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'full-day', label: '🗓️ Full Day', desc: 'Block entire day' },
                                    { value: 'time-slot', label: '⏰ Time Slot', desc: 'Block specific hours' },
                                    { value: 'recurring', label: '🔄 Recurring', desc: 'Weekly recurring block' }
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({...formData, type: type.value})}
                                        className={`p-4 border-2 rounded-lg text-left transition ${
                                            formData.type === type.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-medium">{type.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Full Day Fields */}
                        {formData.type === 'full-day' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        )}

                        {/* Time Slot Fields */}
                        {formData.type === 'time-slot' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Recurring Fields */}
                        {formData.type === 'recurring' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                    <select
                                        required
                                        value={formData.recurringDay}
                                        onChange={(e) => setFormData({...formData, recurringDay: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.recurringStartTime}
                                            onChange={(e) => setFormData({...formData, recurringStartTime: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.recurringEndTime}
                                            onChange={(e) => setFormData({...formData, recurringEndTime: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Vacation, Meeting, Break..."
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium"
                        >
                            Add Unavailability Block
                        </button>
                    </form>
                </div>
            )}

            {/* List of Unavailabilities */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Active Blocks ({unavailabilities.length})</h3>
                </div>
                {unavailabilities.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-gray-500">No unavailability blocks yet</p>
                        <p className="text-sm text-gray-400">Click "Add Block" to create one</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {unavailabilities.map((unavail) => (
                            <div key={unavail._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getTypeBadge(unavail.type)}
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatUnavailability(unavail)}
                                            </span>
                                        </div>
                                        {unavail.reason && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                📝 {unavail.reason}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">
                                            Created: {new Date(unavail.createdAt).toLocaleDateString('el-GR')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(unavail._id)}
                                        className="ml-4 text-red-600 hover:text-red-900 font-medium text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>How it works:</strong> When you add an unavailability block, those time slots will be automatically hidden from your public booking page. Clients won't be able to book during blocked times.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}