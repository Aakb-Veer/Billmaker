'use client';

import React, { forwardRef } from 'react';
import { toGujaratiNumber, formatDateGujarati, paymentModeToGujarati, smartTransliterate } from '@/lib/utils';

interface ReceiptData {
    receipt_no: number;
    sadhak_name: string;
    amount: number;
    date: string;
    payment_mode: string;
    remarks?: string | null;
    created_by?: string;
}

interface ReceiptCardProps {
    data: ReceiptData;
}

const ReceiptCard = forwardRef<HTMLDivElement, ReceiptCardProps>(({ data }, ref) => {
    const getAmountInGujaratiWords = (amount: number): string => {
        const words: Record<number, string> = {
            100: 'એક સો', 200: 'બે સો', 251: 'બે સો એકાવન', 500: 'પાંચ સો',
            1000: 'એક હજાર', 1100: 'અગિયાર સો', 1500: 'પંદર સો', 2000: 'બે હજાર',
            2500: 'પચ્ચીસ સો', 5000: 'પાંચ હજાર', 10000: 'દસ હજાર', 11000: 'અગિયાર હજાર',
        };
        return words[amount] || toGujaratiNumber(amount);
    };

    return (
        <div
            ref={ref}
            style={{
                width: '580px',
                height: '380px',
                background: 'linear-gradient(135deg, #fffef7 0%, #fff8f0 100%)',
                position: 'relative',
                boxShadow: '0 8px 30px -8px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                fontFamily: '"Noto Sans Gujarati", "Noto Sans", Arial, sans-serif',
                color: '#1a1a1a',
                border: '1px solid #e5e7eb',
            }}
        >
            {/* LEFT ORANGE STRIP - PLAIN */}
            <div style={{
                width: '20px',
                background: 'linear-gradient(180deg, #FF6B35 0%, #d94f1a 100%)',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
            }} />

            {/* MAIN CONTENT */}
            <div style={{
                marginLeft: '20px',
                height: '100%',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* HEADER with contact info */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #fed7aa',
                    paddingBottom: '10px',
                    marginBottom: '10px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d', margin: 0, lineHeight: 1.2 }}>
                                આર્ષ અધ્યયન કેન્દ્ર, ભુજ
                            </h1>
                            <p style={{ fontSize: '8px', color: '#666', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                                આર્ષ કુટીર, ૨૪૪, ઓધવ બાગ ૨ રોડ, મધાપર, ગુજરાત ૩૭૦૦૨૦
                            </p>
                            <p style={{ fontSize: '7px', color: '#888', margin: '2px 0 0 0' }}>
                                📞 ૯૪૮૪૮ ૩૨૦૨૯ • ✉ ashram@aakb.org.in • 🌐 www.aakb.org.in
                            </p>
                        </div>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color: 'white',
                        padding: '8px 14px',
                        borderRadius: '0 0 0 12px',
                        textAlign: 'center',
                        marginTop: '-14px',
                        marginRight: '-18px',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>રસીદ</div>
                        <div style={{ fontSize: '7px', opacity: 0.9 }}>દાતા નકલ</div>
                    </div>
                </div>

                {/* Receipt Number and Date */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '10px',
                    background: '#fef3c7',
                    padding: '6px 10px',
                    borderRadius: '6px',
                }}>
                    <span>રસીદ નં. <span style={{ color: '#dc2626' }}>{toGujaratiNumber(data.receipt_no)}</span></span>
                    <span>તારીખ: {formatDateGujarati(data.date)}</span>
                </div>

                {/* BODY FIELDS */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#666', minWidth: '140px', fontWeight: 500 }}>શ્રી/શ્રીમતી:</span>
                        <span style={{ flex: 1, fontWeight: 'bold', fontSize: '15px', borderBottom: '1px dotted #999', paddingBottom: '2px' }}>
                            {smartTransliterate(data.sadhak_name)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#666', minWidth: '140px', fontWeight: 500 }}>રૂપિયા (અંકમાં):</span>
                        <span style={{ flex: 1, fontWeight: 'bold', fontSize: '14px', borderBottom: '1px dotted #999', paddingBottom: '2px' }}>
                            ₹ {toGujaratiNumber(data.amount)}/-
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#666', minWidth: '140px', fontWeight: 500 }}>રૂપિયા (અક્ષરમાં):</span>
                        <span style={{ flex: 1, fontWeight: 600, fontStyle: 'italic', borderBottom: '1px dotted #999', paddingBottom: '2px' }}>
                            {getAmountInGujaratiWords(data.amount)} રૂપિયા માત્ર
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#666', minWidth: '140px', fontWeight: 500 }}>ચુકવણીની રીત:</span>
                        <span style={{ flex: 1, fontWeight: 500, borderBottom: '1px dotted #999', paddingBottom: '2px' }}>
                            {paymentModeToGujarati(data.payment_mode)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#666', minWidth: '140px', fontWeight: 500 }}>નોંધ / હેતુ:</span>
                        <span style={{ flex: 1, fontWeight: 500, borderBottom: '1px dotted #999', paddingBottom: '2px', color: data.remarks ? '#1a1a1a' : '#888', fontStyle: data.remarks ? 'normal' : 'italic' }}>
                            {data.remarks || 'દાન / અર્પણ'}
                        </span>
                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '2px solid #e5e7eb',
                }}>
                    <div style={{
                        border: '3px solid #1a1a1a',
                        padding: '10px 18px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        background: '#fff',
                        borderRadius: '4px',
                    }}>
                        રૂ. {toGujaratiNumber(data.amount)}/-
                    </div>

                    {/* Computerized Note */}
                    <div style={{ textAlign: 'right', maxWidth: '280px' }}>
                        <p style={{
                            fontSize: '8px',
                            color: '#666',
                            margin: 0,
                            lineHeight: 1.4,
                        }}>
                            * આ કોમ્પ્યુટર જનરેટેડ રસીદ છે, તેથી હસ્તાક્ષરની જરૂર નથી.
                        </p>
                        <p style={{
                            fontSize: '7px',
                            color: '#888',
                            margin: '2px 0 0 0',
                            fontStyle: 'italic',
                        }}>
                            * This is a computer generated receipt, no signature required.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

ReceiptCard.displayName = 'ReceiptCard';

export default ReceiptCard;
