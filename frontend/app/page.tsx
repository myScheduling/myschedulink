// Κάνε import αυτά που χρειάζεσαι (από το Firebase και το Next.js)
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; // Το αρχείο που φτιάξαμε πριν
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    // Αυτή είναι όλη η συνάρτηση login!
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        
        try {
            // 1. Ανοίγει το pop-up παράθυρο της Google
            const result = await signInWithPopup(auth, provider);
            
            // 2. Το login πέτυχε!
            const user = result.user;
            console.log("Επιτυχής σύνδεση:", user.displayName);
            
            // 3. Στείλ' τον στο dashboard
            router.push('/dashboard');

        } catch (error) {
            // Κάτι πήγε στραβά (π.χ. έκλεισε το παράθυρο)
            console.error("Σφάλμα σύνδεσης:", error.message);
        }
    };

    return (
        <div>
            <h1>Καλώς ήρθες!</h1>
            <button 
                onClick={handleGoogleLogin}
                className="bg-blue-600 text-white p-3 rounded-lg"
            >
                Σύνδεση με Google
            </button>
        </div>
    );
}