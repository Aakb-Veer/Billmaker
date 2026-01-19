'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase, Sadhak } from '@/lib/supabase';

export default function SadhaksPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [sadhaks, setSadhaks] = useState<Sadhak[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit modal state
    const [editingSadhak, setEditingSadhak] = useState<Sadhak | null>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        } else if (!isLoading && user && user.role !== 'admin') {
            router.replace('/');
        }
    }, [user, isLoading, router]);

    const fetchSadhaks = async () => {
        setIsLoadingData(true);
        try {
            let query = supabase
                .from('sadhaks')
                .select('*')
                .order('name', { ascending: true });

            const { data, error } = await query;

            if (error) throw error;
            setSadhaks(data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSadhaks();
        }
    }, [user]);

    const filteredSadhaks = sadhaks.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone && s.phone.includes(searchQuery))
    );

    const openEditModal = (sadhak: Sadhak) => {
        setEditingSadhak(sadhak);
        setEditName(sadhak.name);
        setEditPhone(sadhak.phone || '');
        setEditAmount(sadhak.default_amount?.toString() || '');
    };

    const closeEditModal = () => {
        setEditingSadhak(null);
        setEditName('');
        setEditPhone('');
        setEditAmount('');
    };

    const saveSadhak = async () => {
        if (!editingSadhak || !editName.trim()) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('sadhaks')
                .update({
                    name: editName.trim(),
                    phone: editPhone.trim() || null,
                    default_amount: editAmount ? parseInt(editAmount) : null,
                })
                .eq('id', editingSadhak.id);

            if (error) throw error;

            // Update local state
            setSadhaks(sadhaks.map(s =>
                s.id === editingSadhak.id
                    ? { ...s, name: editName.trim(), phone: editPhone.trim() || null, default_amount: editAmount ? parseInt(editAmount) : null }
                    : s
            ));
            closeEditModal();
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteSadhak = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

        try {
            const { error } = await supabase
                .from('sadhaks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSadhaks(sadhaks.filter(s => s.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            alert('Cannot delete - Sadhak may have receipts linked');
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <main className="min-h-screen p-4 md:p-6">
            {/* Header */}
            <header className="max-w-4xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="text-lg font-bold text-orange-800">Manage Sadhaks</h1>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <Link href="/bill" className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm">
                            + New Bill
                        </Link>
                        <Link href="/" className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                            🏠
                        </Link>
                        <button onClick={logout} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                            ↗
                        </button>
                    </nav>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                {/* Search */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                    />
                </div>

                {/* Sadhak List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700">All Sadhaks</h3>
                        <span className="text-sm text-gray-500">{filteredSadhaks.length} found</span>
                    </div>

                    {isLoadingData ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : filteredSadhaks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <span className="text-3xl block mb-2">👤</span>
                            No Sadhaks found
                        </div>
                    ) : (
                        <div className="divide-y max-h-[65vh] overflow-y-auto">
                            {filteredSadhaks.map((sadhak) => (
                                <div key={sadhak.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-800">{sadhak.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {sadhak.phone && <span>📞 {sadhak.phone}</span>}
                                            {sadhak.default_amount && <span className="ml-3">💰 ₹{sadhak.default_amount}</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(sadhak)}
                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium"
                                        >
                                            ✏️ Edit
                                        </button>
                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => deleteSadhak(sadhak.id, sadhak.name)}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingSadhak && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Sadhak</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Default Amount (₹)</label>
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    placeholder="Auto-fill amount"
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeEditModal}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveSadhak}
                                disabled={isSaving || !editName.trim()}
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
