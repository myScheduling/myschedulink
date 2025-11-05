"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Αν ο χρήστης είναι ήδη συνδεδεμένος, πήγαινέ τον στο dashboard
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
            // Το onAuthStateChanged θα κάνει redirect αυτόματα
        } catch (error) {
            console.error("Login Error:", error);
            alert("Σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center space-y-8 px-4">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image 
                        src="/logo.png" 
                        alt="MySchedulink.gr Logo" 
                        width={300} 
                        height={120}
                        priority
                        className="drop-shadow-lg"
                    />
                </div>

                {/* Welcome Message */}
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold text-[#1a2847]">
                        Καλώς Ήρθες
                    </h1>
                    <p className="text-xl text-gray-600 max-w-md mx-auto">
                        Διαχειρίσου τα ραντεβού σου εύκολα και γρήγορα
                    </p>
                </div>

                {/* Google Login Button */}
                <div className="pt-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="group relative inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:border-[#4a90e2]"
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
                </div>

                {/* Footer */}
                <p className="text-sm text-gray-500 pt-8">
                    Συνδεθείτε για να αποκτήσετε πρόσβαση στο dashboard σας
                </p>
            </div>
        </div>
    );
}