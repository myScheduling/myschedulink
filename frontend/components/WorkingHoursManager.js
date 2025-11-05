"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const DAYS = [
    { id: 'monday', name: 'Δευτέρα', shortName: 'Δευ' },
    { id: 'tuesday', name: 'Τρίτη', shortName: 'Τρι' },
    { id: 'wednesday', name: 'Τετάρτη', shortName: 'Τετ' },
    { id: 'thursday', name: 'Πέμπτη', shortName: 'Πεμ' },
    { id: 'friday', name: 'Παρασκευή', shortName: 'Παρ' },
    { id: 'saturday', name: 'Σάββατο', shortName: 'Σαβ' },
    { id: 'sunday', name: 'Κυριακή', shortName: 'Κυρ' }
];

export default function WorkingHoursManager() {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Αρχικοποίηση schedule
    useEffect(() => {
        const initialSchedule = {};
        DAYS.forEach(day => {
            initialSchedule[day.id] = {
                isOpen: false,
                slots: [
                    { start: '09:00', end: '14:00' },
                    { start: '', end: '' }
                ]
            };
        });
        setSchedule(initialSchedule);
    }, []);

    // Φόρτωση ωραρίου από Firestore
    useEffect(() => {
        loadSchedule();
    }, [user]);

    const loadSchedule = async () => {
        if (!user?.uid) return;

        try {
            const scheduleRef = doc(db, 'schedules', user.uid);
            const scheduleSnap = await getDoc(scheduleRef);

            if (scheduleSnap.exists()) {
                setSchedule(scheduleSnap.data().schedule);
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
            setMessage('❌ Σφάλμα φόρτωσης ωραρίου');
        } finally {
            setLoading(false);
        }
    };

    // Toggle ημέρα ανοιχτή/κλειστή
    const toggleDay = (dayId) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                isOpen: !prev[dayId].isOpen
            }
        }));
    };

    // Αλλαγή time slot
    const updateSlot = (dayId, slotIndex, field, value) => {
        setSchedule(prev => {
            const newSlots = [...prev[dayId].slots];
            newSlots[slotIndex] = {
                ...newSlots[slotIndex],
                [field]: value
            };
            return {
                ...prev,
                [dayId]: {
                    ...prev[dayId],
                    slots: newSlots
                }
            };
        });
    };

    // Αποθήκευση
    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        // Validation
        let hasError = false;
        Object.entries(schedule).forEach(([dayId, dayData]) => {
            if (dayData.isOpen) {
                dayData.slots.forEach((slot, index) => {
                    if (slot.start && slot.end) {
                        if (slot.start >= slot.end) {
                            setMessage(`❌ Λάθος ώρες στη ${DAYS.find(d => d.id === dayId).name} (Slot ${index + 1})`);
                            hasError = true;
                        }
                    }
                });
            }
        });

        if (hasError) {
            setSaving(false);
            return;
        }

        try {
            const scheduleRef = doc(db, 'schedules', user.uid);
            await setDoc(scheduleRef, {
                userId: user.uid,
                schedule: schedule,
                updatedAt: new Date().toISOString()
            });

            setMessage('✅ Το ωράριο αποθηκεύτηκε επιτυχώς!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving schedule:', error);
            setMessage('❌ Σφάλμα αποθήκευσης. Δοκιμάστε ξανά.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a90e2]"></div>
                <p className="ml-3 text-gray-600">Φόρτωση ωραρίου...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
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

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>💡 Οδηγίες:</strong> Ενεργοποιήστε τις ημέρες που είστε ανοιχτοί και ορίστε τα ωράρια. 
                    Μπορείτε να προσθέσετε 2 διαφορετικά χρονικά διαστήματα ανά ημέρα (π.χ. πρωί και απόγευμα).
                </p>
            </div>

            {/* Schedule Grid */}
            <div className="space-y-4">
                {DAYS.map((day) => (
                    <div
                        key={day.id}
                        className={`bg-white rounded-lg border-2 transition-all ${
                            schedule[day.id]?.isOpen 
                                ? 'border-[#4a90e2] shadow-md' 
                                : 'border-gray-200'
                        }`}
                    >
                        <div className="p-6">
                            {/* Day Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => toggleDay(day.id)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                            schedule[day.id]?.isOpen 
                                                ? 'bg-[#4a90e2]' 
                                                : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                                schedule[day.id]?.isOpen 
                                                    ? 'translate-x-7' 
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>

                                    {/* Day Name */}
                                    <h3 className={`text-lg font-bold ${
                                        schedule[day.id]?.isOpen 
                                            ? 'text-[#1a2847]' 
                                            : 'text-gray-400'
                                    }`}>
                                        {day.name}
                                    </h3>
                                </div>

                                {/* Status Badge */}
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    schedule[day.id]?.isOpen 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {schedule[day.id]?.isOpen ? '✓ Ανοιχτά' : '✕ Κλειστά'}
                                </span>
                            </div>

                            {/* Time Slots */}
                            {schedule[day.id]?.isOpen && (
                                <div className="space-y-3 pl-18">
                                    {schedule[day.id].slots.map((slot, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <span className="text-sm font-semibold text-gray-600 w-20">
                                                {index === 0 ? 'Πρώτο:' : 'Δεύτερο:'}
                                            </span>
                                            
                                            <input
                                                type="time"
                                                value={slot.start}
                                                onChange={(e) => updateSlot(day.id, index, 'start', e.target.value)}
                                                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                                            />
                                            
                                            <span className="text-gray-500 font-bold">—</span>
                                            
                                            <input
                                                type="time"
                                                value={slot.end}
                                                onChange={(e) => updateSlot(day.id, index, 'end', e.target.value)}
                                                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                                            />

                                            {slot.start && slot.end && (
                                                <span className="text-sm text-gray-500">
                                                    ({Math.round((new Date(`2000-01-01 ${slot.end}`) - new Date(`2000-01-01 ${slot.start}`)) / 60000)} λεπτά)
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg ${
                        saving 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-[#4a90e2] hover:bg-[#1a2847]'
                    }`}
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Αποθήκευση...</span>
                        </>
                    ) : (
                        <>
                            <span>💾</span>
                            <span>Αποθήκευση Ωραρίου</span>
                        </>
                    )}
                </button>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>📊 Σύνοψη:</strong> {
                        Object.values(schedule).filter(day => day.isOpen).length
                    } ημέρες ανοιχτές | Αφήστε κενό το 2ο slot αν δεν το χρειάζεστε
                </p>
            </div>
        </div>
    );
}