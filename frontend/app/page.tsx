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
    logoUrl?: string; // 👈 1. ΠΡΟΣΘΕΣΑΜΕ ΤΟ logoUrl ΕΔΩ
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
            {/* Navigation (Ο κώδικάς σου παραμένει ίδιος) */}
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

            {/* Hero Section (Ο κώδικάς σου παραμένει ίδιος) */}
            <section className="py-20 px-4">
                {/* ... (όλη η hero section παραμένει ίδια) ... */}
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

                    {/* Search Bar (Ο κώδικάς σου παραμένει ίδιος) */}
                    <div className="max-w-2xl mx-auto mb-12">
                        {/* ... (το search bar παραμένει ίδιο) ... */}
                    </div>

                    {/* Business Cards */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            {/* ... (το loading spinner παραμένει ίδιο) ... */}
                        </div>
                    ) : filteredBusinesses.length === 0 ? (
                        <div className="text-center py-20">
                            {/* ... (το "Δεν βρέθηκαν" παραμένει ίδιο) ... */}
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
                                        
                                            {/* 🚀 2. ΑΛΛΑΞΑΜΕ ΑΥΤΟ ΤΟ DIV ΜΕ IMG 🚀 */}
                                            <img
                                                src={business.logoUrl || `https://ui-avatars.com/api/?name=${business.businessName?.charAt(0).toUpperCase()}&background=4a90e2&color=fff&size=80`}
                                                alt={`${business.businessName} logo`}
                                                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                            />
                                            {/* 🚀 ΤΕΛΟΣ ΑΛΛΑΓΗΣ 🚀 */}

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

            {/* CTA Section (Ο κώδικάς σου παραμένει ίδιος) */}
            <section className="py-20 px-4 bg-gradient-to-r from-[#4a90e2] to-[#1a2847] text-white">
                {/* ... (το CTA section παραμένει ίδιο) ... */}
            </section>

            {/* Footer (Ο κώδικάς σου παραμένει ίδιος) */}
            <footer className="bg-[#1a2847] text-white py-8">
                {/* ... (το footer παραμένει ίδιο) ... */}
            </footer>
        </div>
    );
}