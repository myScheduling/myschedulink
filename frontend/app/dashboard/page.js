"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProfileManager from '../../components/ProfileManager';
import ServiceManager from '../../components/ServiceManager';
import WorkingHoursManager from '../../components/WorkingHoursManager';
import BookingsManager from '../../components/BookingsManager';
import UnavailabilityManager from '../../components/UnavailabilityManager';
import CalendarView from '../../components/CalendarView';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        
        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            window.history.replaceState({}, '', '/dashboard');
        }
        
        fetchUserData();
    }, [searchParams]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                router.push('/');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/users/me`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                cache: 'no-store'
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setLoading(false);
            } else {
                localStorage.removeItem('token');
                router.push('/');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            router.push('/');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-4">
                            <img 
                                src="/logo.png" 
                                alt="Site Logo" 
                                className="h-40 w-auto"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-600">Welcome back, {user?.displayName}!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {user?._id && (
                                <a
                                    href={`/booking/${user._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                >
                                    View Booking Page
                                </a>
                            )}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {[
                                { id: 'profile', label: 'Profile', icon: '👤' },
                                { id: 'services', label: 'Services', icon: '💼' },
                                { id: 'hours', label: 'Working Hours', icon: '🕐' },
                                { id: 'bookings', label: 'Bookings', icon: '📅' },
                                { id: 'calendar', label: 'Calendar', icon: '📆' },
                                { id: 'unavailability', label: 'Unavailability', icon: '🚫' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'profile' && <ProfileManager user={user} onUpdate={fetchUserData} />}
                {activeTab === 'services' && <ServiceManager />}
                {activeTab === 'hours' && <WorkingHoursManager user={user} onUpdate={fetchUserData} />} 
                {activeTab === 'bookings' && <BookingsManager />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'unavailability' && <UnavailabilityManager />}
            </div>
        </div>
    );
}