// frontend/app/booking/[id]/page.js

import { notFound } from 'next/navigation';
import BookingInterface from '../../../components/BookingInterface';
import { db } from '../../../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';


async function getProfessionalData(id) {
    try {
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return notFound();
        const professional = { _id: id, ...userSnap.data() };

        const servicesQ = query(collection(db, 'services'), where('userId', '==', id));
        const servicesSnap = await getDocs(servicesQ);
        const services = servicesSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

        return { professional, services };
    } catch (error) {
        console.error('Failed to fetch professional data from Firestore:', error);
        return notFound();
    }
}

export default async function BookingPage({ params }) {
    const id = (await params).id;
    const { professional, services } = await getProfessionalData(id);

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
            <div className="w-full max-w-4xl">
                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                    <img 
                        src="/logo.png" 
                        alt="Site Logo" 
                        className="h-40 w-auto"
                    />
                </div>

                <div className="text-center mb-10">
                    {/* --- ΑΝΑΒΑΘΜΙΣΜΕΝΗ ΕΝΟΤΗΤΑ ΠΡΟΦΙΛ --- */}
                    {professional.businessName && (
                        <h1 className="text-4xl font-bold text-blue-600">
                            {professional.businessName}
                        </h1>
                    )}
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">
                        {professional.displayName}
                    </h2>
                    {professional.address && (
                        <p className="text-md text-gray-500 mt-2">
                            {professional.address}
                        </p>
                    )}
                    {professional.phone && (
                        <p className="text-md text-gray-500 mt-1">
                            {professional.phone}
                        </p>
                    )}
                    {/* ------------------------------------- */}
                </div>

                <BookingInterface services={services} professionalId={id} professional={professional} />
            </div>
        </main>
    );
}