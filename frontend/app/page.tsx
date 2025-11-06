"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

// Type για Business
interface Business {
    id: string;
    businessName?: string;
    displayName?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export default function HomePage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('businessName', '!=', null));
            const snapshot = await getDocs(q);
            
            const businessList: Business[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Business, 'id'>)
            })).filter(b => b.businessName); // Μόνο με business name
            
            setBusinesses(businessList);
        } catch (error) {
            console.error('Error loading businesses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBusinesses = businesses.filter(b =>
        b.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md border-b-2 border-[#4a90e2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <Image 
                                src="/logo.png" 
                                alt="MySchedulink.gr" 
                                width={180} 
                                height={60}
                                className="cursor-pointer"
                                onClick={() => router.push('/')}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/login"
                                className="px-6 py-2 text-[#1a2847] font-semibold hover:text-[#4a90e2] transition-colors"
                            >
                                Σύνδεση
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-[#4a90e2] text-white rounded-lg font-semibold hover:bg-[#1a2847] transition-all shadow-md hover:shadow-lg"
                            >
                                🚀 Ξεκίνα Τώρα
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-[#1a2847] mb-6">
                        Διαχείριση Ραντεβού
                        <br />
                        <span className="text-[#4a90e2]">Εύκολα & Γρήγορα</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Η πλατφόρμα που συνδέει επαγγελματίες με πελάτες. 
                        Κλείσε το επόμενο σου ραντεβού online σε λίγα δευτερόλεπτα!
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-[#4a90e2] text-white rounded-lg font-bold text-lg hover:bg-[#1a2847] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            🚀 Ξεκίνα Δωρεάν
                        </Link>
                        <button
                            onClick={() => document.getElementById('businesses')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white text-[#1a2847] border-2 border-[#4a90e2] rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-lg"
                        >
                            📋 Δες Επιχειρήσεις
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                            <div className="text-4xl mb-3">📅</div>
                            <h3 className="font-bold text-lg text-[#1a2847] mb-2">Online Κρατήσεις</h3>
                            <p className="text-gray-600 text-sm">Κλείσε ραντεβού 24/7 από οπουδήποτε</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                            <div className="text-4xl mb-3">⏰</div>
                            <h3 className="font-bold text-lg text-[#1a2847] mb-2">Διαχείριση Ωραρίου</h3>
                            <p className="text-gray-600 text-sm">Έλεγχος διαθεσιμότητας σε πραγματικό χρόνο</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                            <div className="text-4xl mb-3">📧</div>
                            <h3 className="font-bold text-lg text-[#1a2847] mb-2">Ειδοποιήσεις</h3>
                            <p className="text-gray-600 text-sm">Αυτόματα emails επιβεβαίωσης</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
                            <div className="text-4xl mb-3">📊</div>
                            <h3 className="font-bold text-lg text-[#1a2847] mb-2">Analytics</h3>
                            <p className="text-gray-600 text-sm">Στατιστικά και αναφορές</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Businesses Section */}
            <section id="businesses" className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#1a2847] mb-4">
                            Επιχειρήσεις που μας Εμπιστεύονται
                        </h2>
                        <p className="text-lg text-gray-600">
                            Κλείσε το επόμενο σου ραντεβού με μια κλικ
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 Αναζήτηση επιχείρησης ή περιοχής..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Business Cards */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#4a90e2]"></div>
                            <p className="ml-4 text-lg text-gray-600">Φόρτωση επιχειρήσεων...</p>
                        </div>
                    ) : filteredBusinesses.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">
                                {searchQuery ? 'Δεν βρέθηκαν αποτελέσματα' : 'Δεν υπάρχουν επιχειρήσεις ακόμα'}
                            </h3>
                            <p className="text-gray-600">
                                {searchQuery ? 'Δοκίμασε διαφορετική αναζήτηση' : 'Γίνε ο πρώτος που θα προσθέσει την επιχείρησή του!'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBusinesses.map((business) => (
                                <Link
                                    key={business.id}
                                    href={`/booking/${business.id}`}
                                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#4a90e2] hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer"
                                >
                                    {/* Business Card */}
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#4a90e2] to-[#1a2847] rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                                                {business.businessName?.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-[#1a2847] mb-2">
                                                {business.businessName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                👤 {business.displayName}
                                            </p>
                                            {business.address && (
                                                <p className="text-sm text-gray-600 mb-1">
                                                    📍 {business.address}
                                                </p>
                                            )}
                                            {business.phone && (
                                                <p className="text-sm text-gray-600">
                                                    📞 {business.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <span className="text-[#4a90e2] font-semibold hover:text-[#1a2847] transition-colors">
                                            Κλείσε Ραντεβού →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-[#4a90e2] to-[#1a2847] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Έτοιμος να Ξεκινήσεις;
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Εγγραφή δωρεάν και ξεκίνα να δέχεσαι online ραντεβού σήμερα!
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-10 py-4 bg-white text-[#1a2847] rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-1"
                    >
                        🚀 Ξεκίνα Δωρεάν
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1a2847] text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="mb-4">
                        <Image 
                            src="/logo.png" 
                            alt="MySchedulink.gr" 
                            width={150} 
                            height={50}
                            className="mx-auto opacity-80"
                        />
                    </div>
                    <p className="text-gray-400">
                        © 2024 MySchedulink.gr - Διαχείριση Ραντεβού
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Made with ❤️ in Greece
                    </p>
                </div>
            </footer>
        </div>
    );
}