'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import BillForm from '@/components/BillForm';

export default function BillPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    // Show loading only if no cached user
    if (isLoading && !user) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen p-4 md:p-6">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-10 h-10 md:w-12 md:h-12 object-contain"
                        />
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-orange-800" style={{ fontFamily: '"Noto Sans Gujarati", sans-serif' }}>
                                આર્ષ અધ્યયન કેન્દ્ર, ભુજ
                            </h1>
                            <p className="text-xs text-gray-600">Bill Maker</p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2 md:gap-4 text-sm w-full sm:w-auto justify-end">
                        <span className="text-gray-600 hidden sm:inline">{user.name}</span>
                        <Link
                            href="/admin"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Receipts
                        </Link>
                        <Link
                            href="/sadhaks"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Sadhaks
                        </Link>
                        <button
                            onClick={logout}
                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {/* Bill Form */}
            <section className="max-w-6xl mx-auto">
                <BillForm userEmail={user.email} userName={user.name} />
            </section>
        </main>
    );
}
