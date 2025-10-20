"use client";

import { useState, useEffect } from 'react';

export default function StaffManager() {
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        services: [],
        workingHours: {
            monday: [{ start: '09:00', end: '17:00' }],
            tuesday: [{ start: '09:00', end: '17:00' }],
            wednesday: [{ start: '09:00', end: '17:00' }],
            thursday: [{ start: '09:00', end: '17:00' }],
            friday: [{ start: '09:00', end: '17:00' }],
            saturday: [],
            sunday: []
        }
    });

    useEffect(() => {
        fetchStaff();
        fetchServices();
    }, []);

    const fetchStaff = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/staff', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('📊 Staff data received:', data);
                console.log('📊 First staff services:', data[0]?.services);
                setStaff(data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/services', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const url = editingStaff 
            ? `http://localhost:5000/api/staff/${editingStaff._id}`
            : 'http://localhost:5000/api/staff';
        
        const method = editingStaff ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const savedStaff = await res.json();
                console.log('✅ Staff saved:', savedStaff);
                alert(editingStaff ? 'Staff updated!' : 'Staff added!');
                setShowForm(false);
                setEditingStaff(null);
                resetForm();
                // Force refresh after 200ms to ensure backend has processed
                setTimeout(() => {
                    fetchStaff();
                }, 200);
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to save staff');
            }
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Network error');
        }
    };

    const handleEdit = (member) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            email: member.email || '',
            phone: member.phone || '',
            bio: member.bio || '',
            services: member.services.map(s => s._id),
            workingHours: member.workingHours
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this staff member?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/staff/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('Staff removed!');
                fetchStaff();
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Network error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            bio: '',
            services: [],
            workingHours: {
                monday: [{ start: '09:00', end: '17:00' }],
                tuesday: [{ start: '09:00', end: '17:00' }],
                wednesday: [{ start: '09:00', end: '17:00' }],
                thursday: [{ start: '09:00', end: '17:00' }],
                friday: [{ start: '09:00', end: '17:00' }],
                saturday: [],
                sunday: []
            }
        });
    };

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceId)
                ? prev.services.filter(id => id !== serviceId)
                : [...prev.services, serviceId]
        }));
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading staff...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
                        <p className="text-gray-600 mt-1">Manage your staff members and their schedules</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingStaff(null);
                            resetForm();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        {showForm ? '✕ Cancel' : '+ Add Staff Member'}
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="+30 123 456 7890"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                rows="3"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Experience, specialties, etc..."
                                maxLength="500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assigned Services
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {services.map(service => (
                                    <label key={service._id} className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.services.includes(service._id)}
                                            onChange={() => handleServiceToggle(service._id)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">{service.name}</span>
                                        <span className="ml-auto text-xs text-gray-500">{service.duration} min</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium"
                        >
                            {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                        </button>
                    </form>
                </div>
            )}

            {/* Staff List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Team Members ({staff.length})</h3>
                </div>
                {staff.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-2 text-gray-500">No staff members yet</p>
                        <p className="text-sm text-gray-400">Click "Add Staff Member" to get started</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {staff.map(member => (
                            <div key={member._id} className="p-6 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                                        {member.email && (
                                            <p className="text-sm text-gray-600 mt-1">📧 {member.email}</p>
                                        )}
                                        {member.phone && (
                                            <p className="text-sm text-gray-600 mt-1">📱 {member.phone}</p>
                                        )}
                                        {member.bio && (
                                            <p className="text-sm text-gray-700 mt-2">{member.bio}</p>
                                        )}
                                        <div className="mt-3">
                                            <p className="text-xs font-medium text-gray-500 mb-1">SERVICES:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {member.services && member.services.length > 0 ? (
                                                    member.services.map(service => (
                                                        <span key={service._id || service} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {service.name || service}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400">No services assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member._id)}
                                            className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
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
                            <strong>Team Plan Feature:</strong> Add multiple staff members and let clients choose their preferred stylist/therapist when booking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}