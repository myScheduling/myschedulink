"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase'; // 1. Παίρνουμε το auth από το firebase.js
import { onAuthStateChanged, signOut } from "firebase/auth";

// Μπορείς να κρατήσεις τα παλιά σου components
import ProfileManager from '../../components/ProfileManager';
import ServiceManager from '../../components/ServiceManager';
// ... κλπ ...

export default function DashboardPage() {
    const [user, setUser] = useState(null); // Εδώ θα αποθηκεύσουμε τον χρήστη
    const [loading, setLoading] = useState(true); // Ξεκινάμε σε κατάσταση loading
    const [activeTab, setActiveTab] = useState('profile');
    const router = useRouter();

    useEffect(() => {
        // 2. Αυτό είναι το "μαγικό" του Firebase.
        // Αυτή η συνάρτηση τρέχει αυτόματα κάθε φορά που αλλάζει η κατάσταση (login/logout)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // ✅ Ο χρήστης ΕΙΝΑΙ συνδεδεμένος
                console.log("Βρέθηκε χρήστης:", currentUser.displayName);
                setUser(currentUser); // Βάζουμε τον χρήστη στο state
                setLoading(false); // Σταματάμε το loading
            } else {
                // ❌ Ο χρήστης ΔΕΝ είναι συνδεδεμένος
                console.log("Δεν βρέθηκε χρήστης, ανακατεύθυνση...");
                router.push('/'); // Στείλ' τον στην αρχική σελίδα
            }
        });

        // Αυτό "καθαρίζει" τον listener όταν φεύγεις από τη σελίδα
        return () => unsubscribe();
    }, [router]); // Βάζουμε το router ως dependency

    // 3. Η νέα συνάρτηση Logout
    const handleLogout = async () => {
        try {
            await signOut(auth); // Απλά λες στο Firebase "κάνε logout"
            // Ο onAuthStateChanged θα "πιάσει" την αλλαγή και θα κάνει redirect αυτόματα
        } catch (error) {
            console.error("Σφάλμα Logout:", error);
        }
    };

    // 4. Η σελίδα Loading (όσο περιμένουμε το Firebase)
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

    // 5. Η κανονική σου σελίδα (αυτή την είχες ήδη, απλά άλλαξε το user.displayName)
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ... Το Header σου ... */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {user?.displayName}!</p>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                    {/* ... Τα Tabs σου (Profile, Services, κλπ) ... */}
                </div>
            </div>
            
            {/* ... Το περιεχόμενο των Tabs ... */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'profile' && <ProfileManager user={user} />}
                {/* {activeTab === 'services' && <ServiceManager />} */}
                {/* ... κλπ ... */}
            </div>
        </div>
    );
}