"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileManager({ user }) {
    const [profile, setProfile] = useState({
        businessName: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Φόρτωση profile από Firestore
    useEffect(() => {
        async function loadProfile() {
            if (!user?.uid) return;
            
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setProfile({
                        businessName: data.businessName || '',
                        phone: data.phone || '',
                        address: data.address || ''
                    });
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                setMessage('Σφάλμα φόρτωσης προφίλ');
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [user]);

    // Αποθήκευση profile
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                ...profile,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setMessage('✅ Το προφίλ αποθηκεύτηκε επιτυχώς!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage('❌ Σφάλμα αποθήκευσης. Δοκιμάστε ξανά.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a90e2]"></div>
                <p className="ml-3 text-gray-600">Φόρτωση προφίλ...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
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

            <form onSubmit={handleSave} className="space-y-6">
                {/* User Info Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-[#4a90e2] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Συνδεδεμένος ως:</p>
                            <p className="text-lg font-semibold text-[#1a2847]">{user.displayName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Business Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Όνομα Καταστήματος *
                    </label>
                    <input
                        type="text"
                        value={profile.businessName}
                        onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                        placeholder="π.χ. Barber Shop Αθήνα"
                        required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Το όνομα που θα βλέπουν οι πελάτες σας
                    </p>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Τηλέφωνο *
                    </label>
                    <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                        placeholder="π.χ. 210 1234567"
                        required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Για επικοινωνία με τους πελάτες σας
                    </p>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Διεύθυνση *
                    </label>
                    <textarea
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                        placeholder="π.χ. Ακαδημίας 123, Αθήνα 10678"
                        rows="3"
                        required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Η πλήρης διεύθυνση του καταστήματός σας
                    </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        type="submit"
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
                                <span>Αποθήκευση Αλλαγών</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>💡 Σημείωση:</strong> Αυτές οι πληροφορίες θα εμφανίζονται στη δημόσια σελίδα κράτησης ραντεβού.
                </p>
            </div>
        </div>
    );
}