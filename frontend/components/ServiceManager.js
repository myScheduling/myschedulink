"use client";

import { useState, useEffect } from 'react';
// 1. ΕΙΣΑΓΟΥΜΕ ΤΑ ΕΡΓΑΛΕΙΑ ΤΗΣ ΒΑΣΗΣ (db) ΚΑΙ ΤΟΥ USER (auth)
import { db, auth } from '../firebase'; 
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"; 

export default function ServiceManager() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State για τη φόρμα νέας υπηρεσίας
    const [serviceName, setServiceName] = useState('');
    const [serviceDuration, setServiceDuration] = useState(30);
    const [servicePrice, setServicePrice] = useState(15);

    // 2. Η ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΝΑ ΦΕΡΕΙ ΤΑ DATA
    const fetchServices = async () => {
        if (!auth.currentUser) return; // Δεν κάνουμε τίποτα αν δεν έχει φορτώσει ο χρήστης

        setLoading(true);
        try {
            // Φτιάχνουμε ένα "query" (ερώτημα)
            // "Πήγαινε στη συλλογή 'services' και φέρε μου μόνο όσα
            // έχουν 'userId' ίσο με το ID του συνδεδεμένου χρήστη"
            const servicesRef = collection(db, "services");
            const q = query(servicesRef, where("userId", "==", auth.currentUser.uid));

            // Εκτελούμε το query
            const querySnapshot = await getDocs(q);
            
            const userServices = [];
            querySnapshot.forEach((doc) => {
                // doc.data() είναι τα δεδομένα, doc.id είναι το ID του εγγράφου
                userServices.push({ id: doc.id, ...doc.data() });
            });
            
            setServices(userServices);

        } catch (error) {
            console.error("Error fetching services: ", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. ΤΡΕΧΟΥΜΕ ΤΗ ΣΥΝΑΡΤΗΣΗ ΟΤΑΝ ΦΟΡΤΩΝΕΙ Η ΣΕΛΙΔΑ
    useEffect(() => {
        // Περιμένουμε το Firebase να είναι έτοιμο πριν φέρουμε data
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchServices();
            }
        });
        return () => unsubscribe();
    }, []);

    // 4. Η ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΝΑ ΠΡΟΣΘΕΣΕΙ DATA
    const handleAddService = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return; // Ασφάλεια

        try {
            // "Πήγαινε στη συλλογή 'services' και πρόσθεσε ένα νέο έγγραφο"
            const docRef = await addDoc(collection(db, "services"), {
                userId: auth.currentUser.uid, // Συνδέουμε την υπηρεσία με τον user
                name: serviceName,
                duration: parseInt(serviceDuration),
                price: parseFloat(servicePrice)
            });
            
            console.log("Service added with ID: ", docRef.id);
            fetchServices(); // Ξαναφέρνουμε τις υπηρεσίες για να ανανεωθεί η λίστα
            
            // Καθαρίζουμε τη φόρμα
            setServiceName('');
            setServiceDuration(30);
            setServicePrice(15);

        } catch (error) {
            console.error("Error adding service: ", error);
        }
    };

    if (loading) {
        return <p>Loading services...</p>;
    }

    // 5. Η ΦΟΡΜΑ ΚΑΙ Η ΛΙΣΤΑ (παραμένουν σχεδόν ίδιες)
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
                <form onSubmit={handleAddService} className="space-y-4">
                    {/* ... (Τα inputs για serviceName, serviceDuration, servicePrice) ... */}
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Add Service</button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 p-6">Your Services</h3>
                <ul className="divide-y divide-gray-200">
                    {services.map(service => (
                        <li key={service.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-gray-500">{service.duration} minutes - {service.price}€</p>
                            </div>
                            {/* Εδώ θα μπουν τα κουμπιά Edit/Delete */}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}