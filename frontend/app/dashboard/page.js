"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import Image from 'next/image';
import ProfileManager from '../../components/ProfileManager';
import ServiceManager from '../../components/ServiceManager';
import WorkingHoursManager from '../../components/WorkingHoursManager';
import BookingsManager from '../../components/BookingsManager';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                console.log("Χρήστης συνδεδεμένος:", currentUser.displayName);
                setUser(currentUser);
                setLoading(false);
            } else {
                console.log("Δεν βρέθηκε χρήστης, redirect...");
                router.push('/');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Σφάλμα Logout:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#4a90e2] mx-auto"></div>
                    <p className="mt-6 text-lg text-gray-600">Φόρτωση Dashboard...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', name: 'Προφίλ', icon: '👤' },
        { id: 'services', name: 'Υπηρεσίες', icon: '💼' },
        { id: 'schedule', name: 'Ωράριο', icon: '📅' },
        { id: 'bookings', name: 'Ραντεβού', icon: '📋' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-md border-b-4 border-[#4a90e2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center space-x-4">
                            <Image 
                                src="/logo.png" 
                                alt="MySchedulink.gr" 
                                width={180} 
                                height={60}
                                className="cursor-pointer"
                            />
                        </div>

                        {/* User Info & Actions */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm text-gray-500">Καλώς ήρθες,</p>
                                <p className="text-lg font-semibold text-[#1a2847]">{user?.displayName}</p>
                            </div>
                            
                            {/* Booking Link Button */}
                            <button
                                onClick={() => window.open(`/booking/${user?.uid}`, '_blank')}
                                className="flex items-center space-x-2 px-5 py-2 bg-[#4a90e2] text-white rounded-lg font-medium hover:bg-[#1a2847] transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                <span>🔗</span>
                                <span className="hidden md:inline">Booking Link</span>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Αποσύνδεση
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-1 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-300
                                    ${activeTab === tab.id
                                        ? 'border-b-4 border-[#4a90e2] text-[#1a2847] bg-blue-50'
                                        : 'border-b-4 border-transparent text-gray-600 hover:text-[#4a90e2] hover:bg-gray-50'
                                    }
                                `}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span className="whitespace-nowrap">{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
                    {activeTab === 'profile' && (
                        <div>
                            <h2 className="text-2xl font-bold text-[#1a2847] mb-6">Διαχείριση Προφίλ</h2>
                            <ProfileManager user={user} />
                        </div>
                    )}
                    {activeTab === 'services' && (
                        <div>
                            <h2 className="text-2xl font-bold text-[#1a2847] mb-6">Οι Υπηρεσίες μου</h2>
                            <ServiceManager />
                        </div>
                    )}
                    {activeTab === 'schedule' && (
                        <div>
                            <h2 className="text-2xl font-bold text-[#1a2847] mb-6">Ωράριο Λειτουργίας</h2>
                            <WorkingHoursManager />
                        </div>
                    )}
                    {activeTab === 'bookings' && (
                        <div>
                            <h2 className="text-2xl font-bold text-[#1a2847] mb-6">Τα Ραντεβού μου</h2>
                            <BookingsManager />
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-500 text-sm">
                        © 2024 MySchedulink.gr - Διαχείριση Ραντεβού
                    </p>
                </div>
            </footer>
        </div>
    );
}