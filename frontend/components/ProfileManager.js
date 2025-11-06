"use client";

import { useState, useEffect } from 'react';
// 1. Εισάγουμε το db, ΚΑΙ το storage
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
// 2. Εισάγουμε τις συναρτήσεις του Storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfileManager({ user }) {
    const [profile, setProfile] = useState({
        businessName: '',
        phone: '',
        address: '',
        logoUrl: '' // 3. Προσθέσαμε το logoUrl στο state
    });
    
    // 4. Νέο state για το αρχείο που επιλέγει ο χρήστης
    const [logoFile, setLogoFile] = useState(null); 
    const [uploading, setUploading] = useState(false); // Για να δείχνουμε "Uploading..."

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Φόρτωση profile από Firestore (Τώρα φορτώνει ΚΑΙ το logoUrl)
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
                        address: data.address || '',
                        logoUrl: data.logoUrl || '' // 5. Φορτώνουμε το URL του λογότυπου
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

    // 6. Νέα συνάρτηση για όταν ο χρήστης διαλέγει αρχείο
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    // 7. Αποθήκευση profile (Τώρα κάνει ΚΑΙ upload το λογότυπο)
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            let newLogoUrl = profile.logoUrl; // Ξεκινάμε με το URL που ήδη υπάρχει

            // A. Αν ο χρήστης διάλεξε ΝΕΟ αρχείο...
            if (logoFile) {
                setUploading(true);
                setMessage('Ανέβασμα λογότυπου...');
                
                // Φτιάχνουμε το path (π.χ. logos/USER_ID/logo.png)
                const storageRef = ref(storage, `logos/${user.uid}/${logoFile.name}`);
                
                // Ανεβάζουμε το αρχείο
                const snapshot = await uploadBytes(storageRef, logoFile);
                
                // Παίρνουμε το δημόσιο URL του
                newLogoUrl = await getDownloadURL(snapshot.ref);
                
                setUploading(false);
            }

            // B. Αποθηκεύουμε τα πάντα (ΚΑΙ το logoUrl) στο Firestore
            setMessage('Αποθήκευση προφίλ...');
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                ...profile, // (businessName, phone, address)
                logoUrl: newLogoUrl, // Αποθηκεύουμε το URL
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // C. Ενημερώνουμε το state για να φανεί η νέα εικόνα
            setProfile(prev => ({...prev, logoUrl: newLogoUrl}));
            setLogoFile(null); // Καθαρίζουμε το επιλεγμένο αρχείο

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
                {/* User Info Display (ΤΩΡΑ ΜΕ LOGO UPLOAD) */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-6">
                        
                        {/* 8. ΝΕΟ: Εμφάνιση Λογότυπου */}
                        <div className="flex-shrink-0">
                            <img 
                                src={profile.logoUrl || `https://ui-avatars.com/api/?name=${user.displayName?.charAt(0).toUpperCase()}&background=4a90e2&color=fff&size=80`} 
                                alt="Logo" 
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" 
                            />
                        </div>
                        
                        {/* 9. ΝΕΟ: Κουμπί Upload */}
                        <div className="flex-1">
                            <label htmlFor="logoUpload" className="cursor-pointer text-sm text-[#4a90e2] hover:text-[#1a2847] font-semibold">
                                {uploading ? 'Περιμένετε...' : (logoFile ? logoFile.name : 'Αλλαγή Λογότυπου')}
                            </label>
                            <input 
                                id="logoUpload"
                                type="file" 
                                accept="image/png, image/jpeg"
                                className="hidden" 
                                onChange={handleFileChange}
                                disabled={uploading || saving}
                            />
                            <p className="text-xs text-gray-500 mt-1">PNG ή JPG (Μέγιστο 1MB)</p>
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
                        // 10. ΝΕΟ: Κλειδώνει το κουμπί ΚΑΙ όταν ανεβάζει
                        disabled={saving || uploading} 
                        className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg ${
                            (saving || uploading)
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-[#4a90e2] hover:bg-[#1a2847]'
                        }`}
                    >
                        {(saving || uploading) ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                {/* 11. ΝΕΟ: Δυναμικό μήνυμα */}
                                <span>{uploading ? 'Ανέβασμα...' : 'Αποθήκευση...'}</span>
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