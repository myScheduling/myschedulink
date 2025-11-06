"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/dashboard');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login Error:", error);
            alert("Σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Back to Home */}
            <div className="p-4">
                <Link 
                    href="/"
                    className="inline-flex items-center text-[#4a90e2] hover:text-[#1a2847] font-semibold transition-colors"
                >
                    ← Πίσω στην Αρχική
                </Link>
            </div>

            {/* Login Card */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Image 
                            src="/logo.png" 
                            alt="MySchedulink.gr Logo" 
                            width={220} 
                            height={80}
                            priority
                            className="mx-auto drop-shadow-lg"
                        />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#1a2847] mb-3">
                            Σύνδεση Επαγγελματία
                        </h1>
                        <p className="text-gray-600">
                            Συνδέσου για να διαχειριστείς τα ραντεβού σου
                        </p>
                    </div>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full group relative inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:border-[#4a90e2]"
                    >
                        <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-lg font-medium text-gray-700 group-hover:text-[#1a2847] transition-colors">
                            Σύνδεση με Google
                        </span>
                    </button>

                    {/* Info Box */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Πρώτη φορά;</strong> Η σύνδεση με Google θα δημιουργήσει αυτόματα τον λογαριασμό σου.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Για Πελάτες</span>
                        </div>
                    </div>

                    {/* For Clients */}
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            Ψάχνεις να κλείσεις ραντεβού;
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 border-2 border-[#4a90e2] text-[#4a90e2] rounded-lg font-semibold hover:bg-blue-50 transition-all"
                        >
                            📋 Δες Διαθέσιμες Επιχειρήσεις
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center text-gray-500 text-sm">
                <p>© 2024 MySchedulink.gr - Διαχείριση Ραντεβού</p>
            </footer>
        </div>
    );
}