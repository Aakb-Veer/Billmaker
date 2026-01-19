'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import { useAuth } from '@/lib/auth';
import { supabase, Receipt, Sadhak } from '@/lib/supabase';
import { formatDate, getTodayISO } from '@/lib/utils';
import ReceiptCard from '@/components/ReceiptCard';

interface ReceiptWithSadhak extends Receipt {
    sadhaks: Sadhak | null;
}

export default function AdminPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [receipts, setReceipts] = useState<ReceiptWithSadhak[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchName, setSearchName] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithSadhak | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Edit receipt state (admin only)
    const [editingReceipt, setEditingReceipt] = useState<ReceiptWithSadhak | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editRemarks, setEditRemarks] = useState('');
    const [editPaymentMode, setEditPaymentMode] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    // Fetch receipts
    const fetchReceipts = async () => {
        setIsLoadingData(true);
        try {
            let query = supabase
                .from('receipts')
                .select('*, sadhaks(*)')
                .order('receipt_no', { ascending: false })
                .limit(100);

            if (dateFrom) {
                query = query.gte('date', dateFrom);
            }

            if (dateTo) {
                query = query.lte('date', dateTo);
            }

            const { data, error } = await query;

            if (error) throw error;

            let filtered = data || [];

            if (searchName) {
                filtered = filtered.filter((r) =>
                    r.sadhaks?.name?.toLowerCase().includes(searchName.toLowerCase())
                );
            }

            setReceipts(filtered);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchReceipts();
        }
    }, [user, dateFrom, dateTo]);

    const handleSearch = () => {
        fetchReceipts();
    };

    const shareReceipt = async () => {
        if (!receiptRef.current || !selectedReceipt) return;

        try {
            const dataUrl = await toPng(receiptRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                skipFonts: true,
                cacheBust: true,
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `receipt-${selectedReceipt.receipt_no}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Receipt #${selectedReceipt.receipt_no}`,
                    text: `Receipt for ${selectedReceipt.sadhaks?.name} - ₹${selectedReceipt.amount}`,
                    files: [file],
                });
            } else {
                const link = document.createElement('a');
                link.download = `receipt-${selectedReceipt.receipt_no}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    // Edit receipt functions (admin only)
    const openEditReceipt = (receipt: ReceiptWithSadhak) => {
        setEditingReceipt(receipt);
        setEditAmount(receipt.amount.toString());
        setEditRemarks(receipt.remarks || '');
        setEditPaymentMode(receipt.payment_mode);
    };

    const closeEditReceipt = () => {
        setEditingReceipt(null);
        setEditAmount('');
        setEditRemarks('');
        setEditPaymentMode('');
    };

    const saveEditReceipt = async () => {
        if (!editingReceipt || !editAmount) return;

        setIsSavingEdit(true);
        try {
            const { error } = await supabase
                .from('receipts')
                .update({
                    amount: parseInt(editAmount),
                    remarks: editRemarks.trim() || null,
                    payment_mode: editPaymentMode,
                })
                .eq('receipt_no', editingReceipt.receipt_no);

            if (error) throw error;

            // Update local state
            setReceipts(receipts.map(r =>
                r.receipt_no === editingReceipt.receipt_no
                    ? { ...r, amount: parseInt(editAmount), remarks: editRemarks.trim() || null, payment_mode: editPaymentMode }
                    : r
            ));
            if (selectedReceipt?.receipt_no === editingReceipt.receipt_no) {
                setSelectedReceipt({ ...selectedReceipt, amount: parseInt(editAmount), remarks: editRemarks.trim() || null, payment_mode: editPaymentMode });
            }
            closeEditReceipt();
            alert('Receipt updated!');
        } catch (error) {
            console.error('Edit error:', error);
            alert('Failed to update receipt');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const deleteReceipt = async (receiptNo: number) => {
        if (!confirm('Delete this receipt? This cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('receipts')
                .delete()
                .eq('receipt_no', receiptNo);

            if (error) throw error;

            setReceipts(receipts.filter(r => r.receipt_no !== receiptNo));
            if (selectedReceipt?.receipt_no === receiptNo) {
                setSelectedReceipt(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete receipt');
        }
    };

    if (isLoading || !user) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <>
            <main className="min-h-screen p-4 md:p-6">
                {/* Header */}
                <header className="max-w-6xl mx-auto mb-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                            <div>
                                <h1 className="text-lg font-bold text-orange-800">Receipt History</h1>
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

                <div className="max-w-6xl mx-auto">
                    {/* Search - Mobile Optimized */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="col-span-2">
                                <input
                                    type="text"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    placeholder="Search Sadhak name..."
                                    className="w-full p-2.5 border rounded-lg focus:border-orange-500 text-sm"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:border-orange-500 text-sm"
                                    placeholder="From"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:border-orange-500 text-sm"
                                    placeholder="To"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="mt-3 w-full md:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm"
                        >
                            🔍 Search
                        </button>
                    </div>

                    {/* Mobile: Receipt list first, Preview below when selected */}
                    <div className="space-y-4 lg:grid lg:grid-cols-5 lg:gap-6 lg:space-y-0">
                        {/* Receipt List */}
                        <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700 text-sm">Receipts</h3>
                                <span className="text-xs text-gray-500">{receipts.length} found</span>
                            </div>

                            {isLoadingData ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : receipts.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <span className="text-3xl block mb-2">📭</span>
                                    No receipts found
                                </div>
                            ) : (
                                <div className="divide-y max-h-[60vh] overflow-y-auto">
                                    {receipts.map((receipt) => (
                                        <div
                                            key={receipt.receipt_no}
                                            className={`p-3 hover:bg-orange-50 transition-colors ${selectedReceipt?.receipt_no === receipt.receipt_no ? 'bg-orange-100' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setSelectedReceipt(receipt)}
                                                    className="flex-1 text-left"
                                                >
                                                    <p className="font-medium text-gray-800 text-sm">
                                                        #{receipt.receipt_no} - {receipt.sadhaks?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(receipt.date)} • {receipt.payment_mode}
                                                    </p>
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-green-600">₹{receipt.amount}</span>
                                                    {user.role === 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openEditReceipt(receipt); }}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); deleteReceipt(receipt.receipt_no); }}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                                title="Delete"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Receipt Preview */}
                        <div className="lg:col-span-2 order-first lg:order-last">
                            {selectedReceipt ? (
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-700 text-sm">Preview</h3>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                            #{selectedReceipt.receipt_no}
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto flex justify-center">
                                        <div className="transform scale-[0.7] md:scale-[0.85] origin-top -mb-16 md:-mb-8">
                                            <ReceiptCard
                                                ref={receiptRef}
                                                data={{
                                                    receipt_no: selectedReceipt.receipt_no,
                                                    sadhak_name: selectedReceipt.sadhaks?.name || 'Unknown',
                                                    amount: selectedReceipt.amount,
                                                    date: selectedReceipt.date,
                                                    payment_mode: selectedReceipt.payment_mode,
                                                    remarks: selectedReceipt.remarks,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={shareReceipt}
                                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        📤 Share on WhatsApp
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden lg:flex bg-gray-100 rounded-2xl p-6 text-center text-gray-400 border-2 border-dashed items-center justify-center min-h-[200px]">
                                    <div>
                                        <span className="text-3xl block mb-2">👆</span>
                                        <p className="text-sm">Select a receipt to preview</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Receipt Modal (Admin Only) */}
            {
                editingReceipt && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Edit Receipt #{editingReceipt.receipt_no}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sadhak</label>
                                    <p className="p-3 bg-gray-100 rounded-xl text-gray-600">
                                        {editingReceipt.sadhaks?.name || 'Unknown'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                    <select
                                        value={editPaymentMode}
                                        onChange={(e) => setEditPaymentMode(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                    <input
                                        type="text"
                                        value={editRemarks}
                                        onChange={(e) => setEditRemarks(e.target.value)}
                                        placeholder="Optional notes"
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={closeEditReceipt}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEditReceipt}
                                    disabled={isSavingEdit || !editAmount}
                                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl disabled:opacity-50"
                                >
                                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}
