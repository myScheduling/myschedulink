// frontend/components/ProfileManager.js
"use client";

import { useState, useEffect } from 'react';

export default function ProfileManager() {
    const [profile, setProfile] = useState({
        displayName: '',
        businessName: '',
        address: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Φορτώνουμε τα υπάρχοντα στοιχεία του προφίλ όταν ανοίγει η σελίδα
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/users/me', { credentials: 'include' });
                if (res.ok) {
                    const userData = await res.json();
                    setProfile({
                        displayName: userData.displayName || '',
                        businessName: userData.businessName || '',
                        address: userData.address || '',
                        phone: userData.phone || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({ ...prevProfile, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMessage('Saving...');
        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
                credentials: 'include',
            });

            if (res.ok) {
                setMessage('Profile saved successfully!');
            } else {
                throw new Error('Failed to save profile');
            }
        } catch (error) {
            setMessage('Error saving profile. Please try again.');
            console.error(error);
        }
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="w-full max-w-2xl mt-10 p-8 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Your Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
                    <input type="text" name="displayName" id="displayName" value={profile.displayName} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input type="text" name="businessName" id="businessName" value={profile.businessName} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input type="text" name="address" id="address" value={profile.address} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md"/>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
                    Save Profile
                </button>
                {message && <p className="text-center mt-4 text-gray-600">{message}</p>}
            </form>
        </div>
    );
}