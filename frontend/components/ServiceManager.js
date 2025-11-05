"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

export default function ServiceManager() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        duration: '',
        price: ''
    });

    // Φόρτωση υπηρεσιών
    useEffect(() => {
        loadServices();
    }, [user]);

    const loadServices = async () => {
        if (!user?.uid) return;
        
        try {
            const servicesRef = collection(db, 'services');
            const q = query(servicesRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            
            const servicesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setServices(servicesData);
        } catch (error) {
            console.error('Error loading services:', error);
            setMessage('❌ Σφάλμα φόρτωσης υπηρεσιών');
        } finally {
            setLoading(false);
        }
    };

    // Προσθήκη νέας υπηρεσίας
    const handleAdd = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const servicesRef = collection(db, 'services');
            await addDoc(servicesRef, {
                ...formData,
                duration: parseInt(formData.duration),
                price: parseFloat(formData.price),
                userId: user.uid,
                createdAt: new Date().toISOString()
            });

            setMessage('✅ Η υπηρεσία προστέθηκε επιτυχώς!');
            resetForm();
            loadServices();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error adding service:', error);
            setMessage('❌ Σφάλμα προσθήκης υπηρεσίας');
        }
    };

    // Επεξεργασία υπηρεσίας
    const handleEdit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const serviceRef = doc(db, 'services', editingId);
            await updateDoc(serviceRef, {
                ...formData,
                duration: parseInt(formData.duration),
                price: parseFloat(formData.price),
                updatedAt: new Date().toISOString()
            });

            setMessage('✅ Η υπηρεσία ενημερώθηκε επιτυχώς!');
            resetForm();
            loadServices();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating service:', error);
            setMessage('❌ Σφάλμα ενημέρωσης υπηρεσίας');
        }
    };

    // Διαγραφή υπηρεσίας
    const handleDelete = async (id) => {
        if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την υπηρεσία;')) return;

        try {
            const serviceRef = doc(db, 'services', id);
            await deleteDoc(serviceRef);
            
            setMessage('✅ Η υπηρεσία διαγράφηκε επιτυχώς!');
            loadServices();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting service:', error);
            setMessage('❌ Σφάλμα διαγραφής υπηρεσίας');
        }
    };

    // Ετοιμασία για επεξεργασία
    const startEdit = (service) => {
        setEditingId(service.id);
        setFormData({
            name: service.name,
            duration: service.duration.toString(),
            price: service.price.toString()
        });
        setShowForm(true);
    };

    // Reset φόρμας
    const resetForm = () => {
        setFormData({ name: '', duration: '', price: '' });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a90e2]"></div>
                <p className="ml-3 text-gray-600">Φόρτωση υπηρεσιών...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
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

            {/* Add Service Button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-6 flex items-center space-x-2 px-6 py-3 bg-[#4a90e2] text-white rounded-lg font-semibold hover:bg-[#1a2847] transition-all shadow-md hover:shadow-lg"
                >
                    <span>➕</span>
                    <span>Προσθήκη Νέας Υπηρεσίας</span>
                </button>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="mb-8 p-6 bg-white border-2 border-[#4a90e2] rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-[#1a2847] mb-4">
                        {editingId ? '✏️ Επεξεργασία Υπηρεσίας' : '➕ Νέα Υπηρεσία'}
                    </h3>
                    
                    <form onSubmit={editingId ? handleEdit : handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Service Name */}
                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Όνομα Υπηρεσίας *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                                    placeholder="π.χ. Κούρεμα Ανδρικό"
                                    required
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Διάρκεια (λεπτά) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                                    placeholder="30"
                                    min="5"
                                    step="5"
                                    required
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Τιμή (€) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-20 transition-all"
                                    placeholder="15.00"
                                    min="0"
                                    step="0.5"
                                    required
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                            >
                                Ακύρωση
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#4a90e2] text-white rounded-lg font-semibold hover:bg-[#1a2847] transition-all shadow-md"
                            >
                                {editingId ? '💾 Αποθήκευση' : '➕ Προσθήκη'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Services List */}
            {services.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">💼</div>
                    <p className="text-xl text-gray-600 font-semibold mb-2">
                        Δεν έχετε προσθέσει υπηρεσίες ακόμα
                    </p>
                    <p className="text-gray-500">
                        Κάντε κλικ στο κουμπί "Προσθήκη Νέας Υπηρεσίας" για να ξεκινήσετε
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-[#4a90e2] hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-[#1a2847] mb-2">
                                        {service.name}
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <span className="mr-2">⏱️</span>
                                            <span>{service.duration} λεπτά</span>
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <span className="mr-2">💰</span>
                                            <span className="font-semibold text-[#4a90e2]">
                                                {service.price.toFixed(2)} €
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => startEdit(service)}
                                    className="flex-1 px-4 py-2 bg-blue-50 text-[#4a90e2] rounded-lg font-medium hover:bg-blue-100 transition-all"
                                >
                                    ✏️ Επεξεργασία
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all"
                                >
                                    🗑️ Διαγραφή
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Note */}
            {services.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Σύνολο Υπηρεσιών:</strong> {services.length} | Οι υπηρεσίες αυτές θα εμφανίζονται στη δημόσια σελίδα κράτησης.
                    </p>
                </div>
            )}
        </div>
    );
}