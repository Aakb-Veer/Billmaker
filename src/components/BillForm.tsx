'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { supabase, Sadhak, Receipt } from '@/lib/supabase';
import { getTodayISO } from '@/lib/utils';
import SadhakCombobox from './SadhakCombobox';
import ReceiptCard from './ReceiptCard';

interface BillFormProps {
    userEmail?: string;
    userName?: string;
}

export default function BillForm({ userEmail = 'staff@aakb.org.in', userName = 'Staff' }: BillFormProps) {
    const [selectedSadhak, setSelectedSadhak] = useState<Sadhak | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [date, setDate] = useState<string>(getTodayISO());
    const [paymentMode, setPaymentMode] = useState<string>('Cash');
    const [remarks, setRemarks] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedReceipt, setSavedReceipt] = useState<Receipt & { sadhak_name: string } | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [nextReceiptNo, setNextReceiptNo] = useState<number>(1);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Fetch next receipt number on mount
    useEffect(() => {
        const fetchNextReceiptNo = async () => {
            try {
                const { data, error } = await supabase
                    .from('receipts')
                    .select('receipt_no')
                    .order('receipt_no', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (data && !error) {
                    setNextReceiptNo(data.receipt_no + 1);
                } else {
                    setNextReceiptNo(1);
                }
            } catch {
                setNextReceiptNo(1);
            }
        };
        fetchNextReceiptNo();
    }, [savedReceipt]); // Refresh when a receipt is saved


    // Handle sadhak selection - auto-fill amount
    const handleSadhakSelect = (sadhak: Sadhak) => {
        setSelectedSadhak(sadhak);
        if (sadhak.default_amount) {
            setAmount(sadhak.default_amount.toString());
        }
    };

    // Clear form
    const handleClear = () => {
        setSelectedSadhak(null);
        setAmount('');
        setDate(getTodayISO());
        setPaymentMode('Cash');
        setRemarks('');
        setSavedReceipt(null);
    };

    // Save receipt to database
    const saveReceipt = async (): Promise<Receipt | null> => {
        if (!selectedSadhak || !amount) return null;

        try {
            const { data, error } = await supabase
                .from('receipts')
                .insert({
                    sadhak_id: selectedSadhak.id,
                    amount: parseInt(amount),
                    date: date,
                    payment_mode: paymentMode,
                    remarks: remarks || null,
                    created_by: userEmail,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    };

    // Generate filename
    const getFilename = (ext: string) => {
        const sadhakName = selectedSadhak?.name.replace(/\s+/g, '_') || 'Receipt';
        const receiptNo = savedReceipt?.receipt_no || 0;
        return `Receipt_${receiptNo}_${sadhakName}.${ext}`;
    };

    // Export as PNG (high quality)
    const exportAsPNG = async () => {
        if (!receiptRef.current) return;
        setIsExporting(true);

        try {
            const dataUrl = await toPng(receiptRef.current, {
                quality: 1,
                pixelRatio: 3, // High quality
                backgroundColor: '#fff8f0',
                cacheBust: true,
                style: {
                    fontFamily: '"Noto Sans Gujarati", sans-serif',
                },
                fontEmbedCSS: `
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap');
                `,
            });

            const link = document.createElement('a');
            link.download = getFilename('png');
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('PNG export error:', error);
            alert('Failed to export PNG');
        } finally {
            setIsExporting(false);
        }
    };

    // Export as JPEG
    const exportAsJPEG = async () => {
        if (!receiptRef.current) return;
        setIsExporting(true);

        try {
            const dataUrl = await toJpeg(receiptRef.current, {
                quality: 0.95,
                pixelRatio: 3,
                backgroundColor: '#fff8f0',
                cacheBust: true,
                style: {
                    fontFamily: '"Noto Sans Gujarati", sans-serif',
                },
                fontEmbedCSS: `
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap');
                `,
            });

            const link = document.createElement('a');
            link.download = getFilename('jpg');
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('JPEG export error:', error);
            alert('Failed to export JPEG');
        } finally {
            setIsExporting(false);
        }
    };

    // Print receipt
    const printReceipt = () => {
        if (!receiptRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt #${savedReceipt?.receipt_no}</title>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 15mm;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        font-family: "Noto Sans Gujarati", "Arial", sans-serif;
                    }
                    body { 
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff;
                    }
                    .receipt-container {
                        transform: scale(1.5);
                        transform-origin: center center;
                    }
                    @media print {
                        body {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .receipt-container {
                            transform: scale(1.3);
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    ${receiptRef.current.outerHTML}
                </div>
                <script>
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 800);
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Export as PDF (full page A4)
    const exportAsPDF = async () => {
        if (!receiptRef.current) return;
        setIsExporting(true);

        try {
            const dataUrl = await toPng(receiptRef.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: '#fff8f0',
                cacheBust: true,
                style: {
                    fontFamily: '"Noto Sans Gujarati", sans-serif',
                },
                fontEmbedCSS: `
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap');
                `,
            });

            // Create A4 PDF (210 x 297 mm)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            // A4 landscape dimensions: 297 x 210 mm
            const pageWidth = 297;
            const pageHeight = 210;

            // Calculate image dimensions to fit nicely on page with margins
            const margin = 15;
            const maxWidth = pageWidth - (margin * 2);
            const maxHeight = pageHeight - (margin * 2);

            // Get image dimensions
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            const imgRatio = img.width / img.height;
            let imgWidth = maxWidth;
            let imgHeight = imgWidth / imgRatio;

            // If too tall, scale by height instead
            if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = imgHeight * imgRatio;
            }

            // Center the image
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(getFilename('pdf'));
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };
    // Share via native share
    const shareReceipt = async () => {
        if (!receiptRef.current) return;
        setIsExporting(true);

        try {
            const dataUrl = await toPng(receiptRef.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: '#fff8f0',
                cacheBust: true,
                style: {
                    fontFamily: '"Noto Sans Gujarati", sans-serif',
                },
                fontEmbedCSS: `
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap');
                `,
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], getFilename('png'), { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Receipt #${savedReceipt?.receipt_no}`,
                    text: `Receipt for ${savedReceipt?.sadhak_name} - ₹${savedReceipt?.amount}`,
                    files: [file],
                });
            } else {
                // Fallback: download
                const link = document.createElement('a');
                link.download = getFilename('png');
                link.href = dataUrl;
                link.click();
                alert('Image downloaded! Share it manually on WhatsApp.');
            }
        } catch (error) {
            console.error('Share error:', error);
            if ((error as Error).name !== 'AbortError') {
                alert('Failed to share. Image downloaded instead.');
            }
        } finally {
            setIsExporting(false);
        }
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSadhak) {
            alert('કૃપા કરીને સાધક પસંદ કરો (Please select a Sadhak)');
            return;
        }

        if (!amount || parseInt(amount) <= 0) {
            alert('કૃપા કરીને માન્ય રકમ દાખલ કરો (Please enter a valid amount)');
            return;
        }

        setIsSubmitting(true);

        try {
            const receipt = await saveReceipt();
            if (receipt) {
                setSavedReceipt({
                    ...receipt,
                    sadhak_name: selectedSadhak.name,
                });
            }
        } catch {
            alert('રસીદ સાચવવામાં નિષ્ફળ (Failed to save receipt)');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">
                        📝
                    </span>
                    નવી રસીદ બનાવો (Create New Bill)
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sadhak Search */}
                    <SadhakCombobox
                        onSelect={handleSadhakSelect}
                        selectedSadhak={selectedSadhak}
                        onClear={() => setSelectedSadhak(null)}
                    />

                    {/* Date & Amount Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                તારીખ (Date) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                રકમ (Amount) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="500"
                                min="1"
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-xl font-bold text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ચુકવણી રીત (Payment Mode) <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Cash', 'UPI', 'NEFT', 'Cheque'].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setPaymentMode(mode)}
                                    className={`p-2.5 rounded-xl font-medium transition-all text-sm ${paymentMode === mode
                                        ? 'bg-orange-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            નોંધ (Remarks) - Optional
                        </label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="દાન, અર્પણ, વાર્ષિક ફાળો..."
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-gray-800"
                        />
                    </div>

                    {/* Submit Button */}
                    {!savedReceipt ? (
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedSadhak || !amount}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    સાચવી રહ્યા છીએ...
                                </>
                            ) : (
                                <>💾 રસીદ સાચવો (Save Receipt)</>
                            )}
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {/* Export Options */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={exportAsPNG}
                                    disabled={isExporting}
                                    className="py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    📷 PNG
                                </button>
                                <button
                                    type="button"
                                    onClick={exportAsJPEG}
                                    disabled={isExporting}
                                    className="py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    🖼️ JPEG
                                </button>
                                <button
                                    type="button"
                                    onClick={exportAsPDF}
                                    disabled={isExporting}
                                    className="py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    📄 PDF
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={printReceipt}
                                    className="py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                                >
                                    🖨️ Print
                                </button>
                                <button
                                    type="button"
                                    onClick={shareReceipt}
                                    disabled={isExporting}
                                    className="py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    📤 Share
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleClear}
                                className="w-full py-3 bg-orange-100 text-orange-700 font-medium rounded-xl hover:bg-orange-200"
                            >
                                + નવી રસીદ (New Receipt)
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Receipt Preview */}
            {(savedReceipt || (selectedSadhak && amount)) && (
                <div className="bg-white rounded-2xl shadow-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">રસીદ પ્રિવ્યુ</h3>
                        {savedReceipt && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                ✅ #{savedReceipt.receipt_no}
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div style={{
                            width: '290px',
                            height: '190px',
                            margin: '0 auto',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                transform: 'scale(0.5)',
                                transformOrigin: 'top left',
                            }}>
                                <ReceiptCard
                                    ref={receiptRef}
                                    data={{
                                        receipt_no: savedReceipt?.receipt_no || nextReceiptNo,
                                        sadhak_name: selectedSadhak?.name || '',
                                        amount: parseInt(amount) || 0,
                                        date: date,
                                        payment_mode: paymentMode,
                                        remarks: remarks,
                                        created_by: userName,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
