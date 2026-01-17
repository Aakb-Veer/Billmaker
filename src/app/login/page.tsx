'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const { user, isLoading: isAuthLoading, login, signup } = useAuth();
    const router = useRouter();

    // Get redirect path based on role
    const getRedirectPath = (role: string) => {
        return role === 'bill_maker' ? '/bill' : '/';
    };

    // Redirect if already logged in
    useEffect(() => {
        if (!isAuthLoading && user) {
            router.push(getRedirectPath(user.role));
        }
    }, [user, isAuthLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const action = isSignup ? signup : login;
        const result = await action(email, password);

        if (result.success) {
            // Will redirect via useEffect when user state updates
        } else {
            setError(result.error || 'Action failed');
        }

        setIsLoading(false);
    };

    // Show loading while checking auth
    if (isAuthLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fffbeb 100%)' }}>
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    // Show "already logged in" message if user exists
    if (user) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fffbeb 100%)' }}>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center" style={{ boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' }}>
                    <div className="text-4xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Already Logged In</h2>
                    <p className="text-gray-600 mb-4">You are logged in as <strong>{user.name}</strong></p>
                    <button
                        onClick={() => router.push(getRedirectPath(user.role))}
                        className="w-full py-3 text-white font-bold rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                    >
                        {user.role === 'bill_maker' ? 'Go to Bill Maker' : 'Go to Dashboard'}
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fffbeb 100%)' }}>
            <div className="w-full max-w-sm">
                {/* Logo & Header */}
                <div className="text-center mb-6">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-20 h-20 mx-auto mb-3 object-contain"
                    />
                    <h1
                        className="text-2xl font-bold mb-1"
                        style={{ fontFamily: '"Noto Sans Gujarati", sans-serif', color: '#c2410c' }}
                    >
                        આર્ષ અધ્યયન કેન્દ્ર, ભુજ
                    </h1>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Billing & Donation Management</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200" style={{ boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' }}>
                    <h2 className="text-lg font-semibold mb-5 text-center" style={{ color: '#1f2937' }}>
                        {isSignup ? '📝 Create Account' : '🔐 Staff Login'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.name@aakb.org.in"
                                required
                                style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={isSignup ? 'Create password (min 6 chars)' : 'Enter your password'}
                                required
                                minLength={6}
                                style={{ color: '#1f2937', backgroundColor: '#f9fafb' }}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 4px 14px -3px rgba(249, 115, 22, 0.5)' }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isSignup ? 'Creating...' : 'Logging in...'}
                                </>
                            ) : (
                                isSignup ? 'Create Account' : 'Login'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsSignup(!isSignup)}
                            className="w-full text-center text-sm font-medium"
                            style={{ color: '#ea580c' }}
                        >
                            {isSignup ? '← Already have account? Login' : 'New user? Create account →'}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-4" style={{ color: '#9ca3af' }}>
                        Only @aakb.org.in emails allowed
                    </p>
                </div>
            </div>
        </main>
    );
}
