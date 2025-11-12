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
            })).filter(b => b.businessName);
            
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
        <div className="min-h-screen bg-white">
            {/* Navigation - Premium Design */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 z-50">
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
                                className="hidden sm:block px-6 py-2 text-gray-700 font-semibold hover:text-[#4a90e2] transition-colors"
                            >
                                Σύνδεση
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                Ξεκίνα Δωρεάν
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Modern & Bold */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDEwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 -z-10"></div>

                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                            🚀 Η Νο1 Πλατφόρμα για Ραντεβού στην Ελλάδα
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                            Διαχείριση Ραντεβού
                            <br />
                            <span className="text-5x1 bg-clip-text bg-gradient-to-r from-[#4a90e2] to-[#8b5cf6]">
                                Χωρίς Κόπο
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Αυτοματοποίησε τις κρατήσεις, εξοικονόμησε χρόνο και αύξησε τα έσοδά σου με την πιο έξυπνη πλατφόρμα διαχείρισης ραντεβού.
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                            <Link
                                href="/login"
                                className="px-10 py-5 bg-white text-gray-900 border-3 border-gray-300 rounded-2xl font-bold text-xl hover:border-[#4a90e2] hover:shadow-xl transition-all duration-300 shadow-md"
                            >
                                Ξεκίνα Δωρεάν
                                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <button
                                onClick={() => document.getElementById('businesses')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-10 py-5 bg-white text-gray-900 border-3 border-gray-300 rounded-2xl font-bold text-xl hover:border-[#4a90e2] hover:shadow-xl transition-all duration-300 shadow-md"
                            >
                                Δες Επιχειρήσεις
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">⭐</span>
                                <span>Εξαιρετική αξιολόγηση</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">✅</span>
                                <span>Εύκολο Setup</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">⚡</span>
                                <span>Άμεση χρήση</span>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid - Modern Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { icon: "📅", title: "Online Κρατήσεις 24/7", desc: "Οι πελάτες σου κλείνουν ραντεβού ανά πάσα στιγμή" },
                            { icon: "🔔", title: "Αυτόματες Ειδοποιήσεις", desc: "Email & SMS επιβεβαιώσεις χωρίς χειροκίνητη δουλειά" },
                            { icon: "📊", title: "Analytics & Insights", desc: "Δες πώς αναπτύσσεται η επιχείρησή σου" },
                            { icon: "🚀", title: "Γρήγορο & Απλό", desc: "Ξεκίνα να δέχεσαι κρατήσεις σε λεπτά" }
                        ].map((feature, i) => (
                            <div key={i} className="group relative bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#4a90e2] hover:-translate-y-2">
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                <h3 className="font-bold text-xl text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 text-base leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                            Πώς Λειτουργεί;
                        </h2>
                        <p className="text-xl text-gray-600">
                            3 απλά βήματα για να ξεκινήσεις
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "Εγγραφή", desc: "Δημιούργησε λογαριασμό με το Google σε δευτερόλεπτα", icon: "🚀" },
                            { step: "2", title: "Ρύθμιση", desc: "Πρόσθεσε τις υπηρεσίες σου και το ωράριό σου", icon: "⚙️" },
                            { step: "3", title: "Ξεκίνα", desc: "Μοίρασε το link και άρχισε να δέχεσαι κρατήσεις!", icon: "🎉" }
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100">
                                    <div className="text-6xl mb-4">{item.icon}</div>
                                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-[#4a90e2] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-4xl text-gray-300">
                                        →
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Businesses Section - Premium Design */}
            <section id="businesses" className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                            Επιχειρήσεις στην Πλατφόρμα
                        </h2>
                        <p className="text-xl text-gray-600">
                            Κλείσε το επόμενο σου ραντεβού τώρα
                        </p>
                    </div>

                    {/* Search Bar - Modern */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Αναζήτηση επιχείρησης ή περιοχής..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-5 border-2 border-gray-200 rounded-2xl text-lg focus:border-[#4a90e2] focus:ring-4 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Business Cards - Premium Grid */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#4a90e2] mb-4"></div>
                            <p className="text-lg text-gray-600">Φόρτωση επιχειρήσεων...</p>
                        </div>
                    ) : filteredBusinesses.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-7xl mb-6">🔍</div>
                            <h3 className="text-3xl font-bold text-gray-700 mb-3">
                                {searchQuery ? 'Δεν βρέθηκαν αποτελέσματα' : 'Γίνε ο πρώτος!'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery ? 'Δοκίμασε διαφορετική αναζήτηση' : 'Πρόσθεσε την επιχείρησή σου και ξεκίνα να δέχεσαι κρατήσεις!'}
                            </p>
                            {!searchQuery && (
                                <Link
                                    href="/login"
                                    className="inline-block px-8 py-4 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white rounded-xl font-bold hover:shadow-xl transition-all"
                                >
                                    Προσθήκη Επιχείρησης
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBusinesses.map((business) => (
                                <Link
                                    key={business.id}
                                    href={`/booking/${business.id}`}
                                    className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#4a90e2] hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                                >
                                    <div className="flex items-start space-x-4 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#4a90e2] to-[#8b5cf6] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                                                {business.businessName?.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#4a90e2] transition-colors">
                                                {business.businessName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-1 flex items-center">
                                                <span className="mr-2">👤</span>
                                                {business.displayName}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        {business.address && (
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <span className="mr-2">📍</span>
                                                {business.address}
                                            </p>
                                        )}
                                        {business.phone && (
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <span className="mr-2">📞</span>
                                                {business.phone}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        <span className="inline-flex items-center text-[#4a90e2] font-semibold group-hover:gap-2 transition-all">
                                            <span>Κλείσε Ραντεβού</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section - Bold & Conversion Focused */}
            <section className="relative py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4a90e2] via-[#357abd] to-[#8b5cf6] -z-10"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZjIwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 -z-10"></div>
                
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-black mb-6">
                        Ξεκίνα Τώρα
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
                        Δημιούργησε λογαριασμό και ξεκίνα να διαχειρίζεσαι<br />τα ραντεβού σου επαγγελματικά σε λεπτά.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/login"
                            className="group relative px-12 py-6 bg-white text-[#4a90e2] rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-3">
                                <span>Ξεκίνα Τώρα</span>
                                <svg className="w-7 h-7 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                        <button
                            onClick={() => document.getElementById('businesses')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group px-12 py-6 bg-transparent text-white border-3 border-white rounded-2xl font-bold text-xl hover:bg-white hover:text-[#4a90e2] transition-all duration-300 shadow-lg"
                        >
                            <span className="flex items-center justify-center space-x-3">
                                <span>Δες Επιχειρήσεις</span>
                                <svg className="w-7 h-7 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                    </div>
                    <div className="mt-8 flex items-center justify-center space-x-6 text-sm opacity-90">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Εύκολη εγγραφή</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Γρήγορο setup</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Υποστήριξη 24/7</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Clean & Modern */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <Image 
                                src="/logo.png" 
                                alt="MySchedulink.gr" 
                                width={150} 
                                height={50}
                                className="mb-4 opacity-80"
                            />
                            <p className="text-gray-400 text-sm">
                                Η πιο έξυπνη πλατφόρμα για διαχείριση ραντεβού στην Ελλάδα
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Προϊόν</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/login" className="hover:text-white transition-colors">Χαρακτηριστικά</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Τιμολόγηση</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Demo</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Εταιρεία</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/login" className="hover:text-white transition-colors">Σχετικά</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Επικοινωνία</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Νομικά</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/login" className="hover:text-white transition-colors">Όροι Χρήσης</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Απόρρητο</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Cookies</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 MySchedulink.gr - Όλα τα δικαιώματα κατοχυρωμένα
                        </p>
                        <p className="text-gray-500 text-sm mt-2 md:mt-0">
                            Made with ❤️ in Greece
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}