// frontend/components/ServiceManager.js
"use client";

import { useState, useEffect } from 'react';
import API_URL from '../config/api';  // ← ΠΡΟΣΘΗΚΗ


export default function ServiceManager() {
    const [services, setServices] = useState([]);
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');

    // Fetch services when component loads
    useEffect(() => {
        const fetchServices = async () => {
            const res = await fetch('http://`${API_URL}/api/services', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        };
        fetchServices();
    }, []);

    const handleAddService = async (e) => {
        e.preventDefault(); // Για να μην κάνει refresh η σελίδα
        if (!name || !duration) {
            setError('Name and duration are required.');
            return;
        }

        const res = await fetch('http://`${API_URL}/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, duration: Number(duration), price: Number(price) }),
            credentials: 'include',
        });

        if (res.ok) {
            const newService = await res.json();
            setServices([...services, newService]); // Πρόσθεσε τη νέα υπηρεσία στη λίστα
            // Καθάρισε τα πεδία της φόρμας
            setName('');
            setDuration('');
            setPrice('');
            setError('');
        } else {
            const data = await res.json();
            setError(data.message || 'Failed to add service.');
        }
    };

    return (
        <div className="w-full max-w-2xl mt-10 p-8 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Services</h2>

            {/* Φόρμα Προσθήκης Νέας Υπηρεσίας */}
            <form onSubmit={handleAddService} className="mb-8 p-6 border rounded-md bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Service Name (e.g., Men's Haircut)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                    <input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                    <input
                        type="number"
                        placeholder="Price (€)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                </div>
                <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
                    + Add Service
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>

            {/* Λίστα Υπαρχουσών Υπηρεσιών */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Existing Services</h3>
                <ul className="space-y-3">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <li key={service._id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md">
                                <span className="font-medium text-gray-900">{service.name}</span>
                                <span className="text-gray-600">{service.duration} min</span>
                                <span className="text-gray-600">{service.price ? `€${service.price}` : ''}</span>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500">You haven't added any services yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}
