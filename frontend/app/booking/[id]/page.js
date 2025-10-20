// frontend/app/booking/[id]/page.js

import { notFound } from 'next/navigation';
import BookingInterface from '../../../components/BookingInterface';

async function getProfessionalData(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/users/${id}/public`, {
            cache: 'no-store',
        });
        if (!res.ok) {
            return notFound();
        }
        return res.json();
    } catch (error) {
        console.error("Failed to fetch professional data:", error);
        return notFound();
    }
}

export default async function BookingPage({ params }) {
    const id = (await params).id;
    const professional = await getProfessionalData(id);

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

                <BookingInterface services={professional.services} professionalId={id} />
            </div>
        </main>
    );
}