'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-orange-800" style={{ fontFamily: '"Noto Sans Gujarati", sans-serif' }}>
                આર્ષ અધ્યયન કેન્દ્ર, ભુજ
              </h1>
              <p className="text-xs md:text-sm text-gray-600">Billing & Donation Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Bill Maker Card */}
        <Link href="/bill" className="group">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 md:p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg">
              🧾
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Create New Bill</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Search or add Sadhak, enter amount, and generate receipt instantly.
            </p>
            <div className="flex items-center text-orange-600 font-semibold text-sm md:text-base">
              Start Billing
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Admin/Search Card */}
        <Link href="/admin" className="group">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg">
              🔍
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Search History</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Find old receipts by Sadhak name or date. Re-share any receipt.
            </p>
            <div className="flex items-center text-slate-600 font-semibold text-sm md:text-base">
              View All Receipts
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Sadhak Management Card - Admin Only */}
        {user.role === 'admin' && (
          <Link href="/sadhaks" className="group">
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 md:p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                👥
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Manage Sadhaks</h2>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Edit Sadhak names, phone numbers, and default amounts.
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm md:text-base">
                View All Sadhaks
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        )}

        {/* Admin Panel - Only for admins */}
        {user.role === 'admin' && (
          <Link href="/settings" className="group">
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 md:p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                ⚙️
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Admin Settings</h2>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Manage users, WhatsApp settings, and organization details
              </p>
              <div className="flex items-center text-purple-600 font-semibold text-sm md:text-base">
                Open Settings
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-8 md:mt-12 text-center text-xs md:text-sm text-gray-500">
        <p>📍 Ashram Kutir, 244, Street No 9, Madhapar, Bhuj-Kutch</p>
        <p className="mt-1">📞 94848 32029 | ✉️ ashram@aakb.org.in</p>
      </footer>
    </main>
  );
}
