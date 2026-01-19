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
      window.location.href = '/login';
    }
  }, [user, isLoading]);

  // Show minimal loading only if no cached user
  if (isLoading && !user) {
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

      {/* Quick Actions Grid */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link
            href="/bill"
            className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
          >
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">🧾</div>
            <h3 className="font-bold text-gray-800 text-sm md:text-base">Create Bill</h3>
            <p className="text-xs text-gray-500 mt-1">Generate new receipt</p>
          </Link>

          {user.role === 'admin' && (
            <>
              <Link
                href="/admin"
                className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base">View Receipts</h3>
                <p className="text-xs text-gray-500 mt-1">Search & manage</p>
              </Link>

              <Link
                href="/sadhaks"
                className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Sadhaks</h3>
                <p className="text-xs text-gray-500 mt-1">Manage donors</p>
              </Link>

              <Link
                href="/settings"
                className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Settings</h3>
                <p className="text-xs text-gray-500 mt-1">Admin panel</p>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Today's Stats */}
      <section className="max-w-6xl mx-auto mt-6 md:mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Today&apos;s Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <p className="text-xs text-green-600 font-medium">Status</p>
            <p className="text-lg md:text-2xl font-bold text-green-700">Active</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <p className="text-xs text-orange-600 font-medium">Role</p>
            <p className="text-lg md:text-2xl font-bold text-orange-700 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 col-span-2 md:col-span-1">
            <p className="text-xs text-blue-600 font-medium">Email</p>
            <p className="text-sm md:text-base font-bold text-blue-700 truncate">{user.email}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
