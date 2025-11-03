// frontend/components/WorkingHoursManager.js
"use client";

import { useState, useEffect } from 'react';
import API_URL from '../config/api';


const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WorkingHoursManager() {
    const [hours, setHours] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserHours = async () => {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/users/me', { credentials: 'include' });
            if (res.ok) {
                const userData = await res.json();
                setHours(userData.workingHours);
            }
            setLoading(false);
        };
        fetchUserHours();
    }, []);

    const handleTimeChange = (day, index, field, value) => {
        const newHours = JSON.parse(JSON.stringify(hours)); // Deep copy
        newHours[day][index][field] = value;
        setHours(newHours);
    };

    const handleDayToggle = (day, isChecked) => {
        const newHours = { ...hours };
        if (isChecked && newHours[day].length === 0) {
            newHours[day] = [{ start: '09:00', end: '17:00' }];
        } else if (!isChecked) {
            newHours[day] = [];
        }
        setHours(newHours);
    };

    // --- ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΠΡΟΣΘΗΚΗ ΩΡΑΡΙΟΥ ---
    const addSlot = (day) => {
        const newHours = JSON.parse(JSON.stringify(hours));
        newHours[day].push({ start: '17:00', end: '21:00' }); // Προσθέτει ένα default απογευματινό slot
        setHours(newHours);
    };

    // --- ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΑΦΑΙΡΕΣΗ ΩΡΑΡΙΟΥ ---
    const removeSlot = (day, index) => {
        const newHours = JSON.parse(JSON.stringify(hours));
        newHours[day].splice(index, 1); // Αφαιρεί το slot από τη λίστα
        setHours(newHours);
    };

    const handleSaveChanges = async () => {
        setMessage('Saving...');
        const res = await fetch(`${API_URL}/api/users/working-hours', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workingHours: hours }),
            credentials: 'include',
        });
        if (res.ok) {
            setMessage('Working hours saved successfully!');
        } else {
            setMessage('Error saving hours. Please try again.');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return <p>Loading working hours...</p>;
    }

    return (
        <div className="w-full max-w-2xl mt-10 p-8 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Working Hours</h2>
            <div className="space-y-4">
                {daysOfWeek.map(day => (
                    <div key={day} className="p-4 border rounded-md bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={hours[day].length > 0} onChange={(e) => handleDayToggle(day, e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <span className="block text-md font-medium text-gray-700 capitalize">{day}</span>
                            </label>
                            {/* --- ΝΕΟ ΚΟΥΜΠΙ '+' --- */}
                            {hours[day].length > 0 && (
                                <button onClick={() => addSlot(day)} className="flex items-center justify-center h-6 w-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-lg">+</button>
                            )}
                        </div>
                        {/* --- ΑΝΑΒΑΘΜΙΣΜΕΝΗ ΛΟΓΙΚΗ ΓΙΑ ΝΑ ΔΕΙΧΝΕΙ ΠΟΛΛΑΠΛΑ SLOTS --- */}
                        <div className="space-y-2 mt-2">
                            {hours[day].map((slot, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="time" value={slot.start} onChange={(e) => handleTimeChange(day, index, 'start', e.target.value)} className="p-2 border rounded-md w-32"/>
                                    <span>-</span>
                                    <input type="time" value={slot.end} onChange={(e) => handleTimeChange(day, index, 'end', e.target.value)} className="p-2 border rounded-md w-32"/>
                                    <button onClick={() => removeSlot(day, index)} className="flex items-center justify-center h-6 w-6 bg-red-500 text-white rounded-full hover:bg-red-600 text-lg">×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleSaveChanges} className="mt-6 w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition">Save Changes</button>
            {message && <p className="text-center mt-4 text-gray-600">{message}</p>}
        </div>
    );
}